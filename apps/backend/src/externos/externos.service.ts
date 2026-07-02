import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import {
  createHmac,
  randomInt,
  timingSafeEqual,
} from 'crypto';

import { Externo } from './entities/externo.entity';
import { CreateExternoDto } from './dto/create-externo.dto';
import { UpdateExternoDto } from './dto/update-externo.dto';

@Injectable()
export class ExternosService {

  constructor(
    @InjectRepository(Externo)
    private readonly externoRepository: Repository<Externo>,

    private readonly configService: ConfigService,
  ) {}

  async enviarCodigoVerificacion(correo: string) {
    const correoNormalizado = correo.trim().toLowerCase();

    const correoExistente = await this.externoRepository.findOne({
      where: {
        correo: correoNormalizado,
      },
    });

    if (correoExistente) {
      throw new ConflictException(
        'Este correo ya fue registrado anteriormente.',
      );
    }

    const codigo = String(randomInt(100000, 999999));

    const verificationToken = this.crearTokenCodigo(
      correoNormalizado,
      codigo,
    );

    await this.enviarCorreoCodigo(
      correoNormalizado,
      codigo,
    );

    return {
      mensaje:
        'Código enviado correctamente. Revisa tu correo electrónico.',
      verificationToken,
    };
  }

  async create(createExternoDto: CreateExternoDto) {
    const {
      codigoVerificacion,
      verificationToken,
      ...datosRegistro
    } = createExternoDto;

    const correoNormalizado =
      datosRegistro.correo.trim().toLowerCase();

    this.validarCodigoVerificacion(
      verificationToken,
      codigoVerificacion,
      correoNormalizado,
    );

    const correoExistente = await this.externoRepository.findOne({
      where: {
        correo: correoNormalizado,
      },
    });

    if (correoExistente) {
      throw new ConflictException(
        'Este correo ya fue registrado anteriormente.',
      );
    }

    const externo = this.externoRepository.create({
      ...datosRegistro,
      correo: correoNormalizado,
      correoVerificado: true,
      status: 'pendiente',
    });

    return await this.externoRepository.save(externo);
  }

  async findAll() {
    return await this.externoRepository.find();
  }

  async findOne(id: string) {
    const externo = await this.externoRepository.findOne({
      where: { id },
    });

    if (!externo) {
      throw new NotFoundException('Externo no encontrado');
    }

    return externo;
  }

  async update(
    id: string,
    updateExternoDto: UpdateExternoDto,
  ) {
    const externo = await this.findOne(id);

    Object.assign(externo, updateExternoDto);

    return await this.externoRepository.save(externo);
  }

  async remove(id: string) {
    const externo = await this.findOne(id);

    return await this.externoRepository.remove(externo);
  }

  private crearTokenCodigo(
    correo: string,
    codigo: string,
  ) {
    const secret =
      this.configService.get<string>('EMAIL_VERIFICATION_SECRET') ||
      'clave_temporal_desarrollo';

    const codigoHash = createHmac('sha256', secret)
      .update(codigo)
      .digest('base64url');

    const payload = {
      correo,
      codigoHash,
      expiraEn: Date.now() + 1000 * 60 * 10,
    };

    const payloadBase64 = Buffer
      .from(JSON.stringify(payload))
      .toString('base64url');

    const firma = createHmac('sha256', secret)
      .update(payloadBase64)
      .digest('base64url');

    return `${payloadBase64}.${firma}`;
  }

  private validarCodigoVerificacion(
    token: string,
    codigo: string,
    correo: string,
  ) {
    if (!token || !codigo) {
      throw new BadRequestException(
        'Código de verificación requerido.',
      );
    }

    const secret =
      this.configService.get<string>('EMAIL_VERIFICATION_SECRET') ||
      'clave_temporal_desarrollo';

    const partes = token.split('.');

    if (partes.length !== 2) {
      throw new BadRequestException(
        'Código incorrecto. Verifica tu correo electrónico o vuelve a intentarlo.',
      );
    }

    const [payloadBase64, firmaRecibida] = partes;

    const firmaEsperada = createHmac('sha256', secret)
      .update(payloadBase64)
      .digest('base64url');

    const firmaRecibidaBuffer = Buffer.from(firmaRecibida);
    const firmaEsperadaBuffer = Buffer.from(firmaEsperada);

    if (
      firmaRecibidaBuffer.length !== firmaEsperadaBuffer.length ||
      !timingSafeEqual(
        firmaRecibidaBuffer,
        firmaEsperadaBuffer,
      )
    ) {
      throw new BadRequestException(
        'Código incorrecto. Verifica tu correo electrónico o vuelve a intentarlo.',
      );
    }

    const payload = JSON.parse(
      Buffer.from(payloadBase64, 'base64url').toString('utf8'),
    ) as {
      correo: string;
      codigoHash: string;
      expiraEn: number;
    };

    if (payload.correo !== correo) {
      throw new BadRequestException(
        'El código no corresponde a este correo electrónico.',
      );
    }

    if (payload.expiraEn < Date.now()) {
      throw new BadRequestException(
        'El código ha expirado. Solicita uno nuevo.',
      );
    }

    const codigoHashRecibido = createHmac('sha256', secret)
      .update(codigo.trim())
      .digest('base64url');

    if (payload.codigoHash !== codigoHashRecibido) {
      throw new BadRequestException(
        'Código incorrecto. Verifica tu correo electrónico o vuelve a intentarlo.',
      );
    }
  }

  private async enviarCorreoCodigo(
    correo: string,
    codigo: string,
  ) {
    const mailHost = this.configService.get<string>('MAIL_HOST');
    const mailPort = Number(
      this.configService.get<string>('MAIL_PORT') || 465,
    );
    const mailUser = this.configService.get<string>('MAIL_USER');
    const mailPass = this.configService.get<string>('MAIL_PASS');
    const mailFrom =
      this.configService.get<string>('MAIL_FROM') || mailUser;

    if (!mailHost || !mailUser || !mailPass) {
      console.warn(
        `Correo no configurado. Código para ${correo}: ${codigo}`,
      );

      return;
    }

    const transporter = nodemailer.createTransport({
      host: mailHost,
      port: mailPort,
      secure: mailPort === 465,
      auth: {
        user: mailUser,
        pass: mailPass,
      },
    });

    await transporter.sendMail({
      from: mailFrom,
      to: correo,
      subject: 'Código de verificación - Congreso UTVM',
      html: `
        <div style="font-family: Arial, sans-serif; color: #1d2b28;">
          <h2>Código de verificación</h2>

          <p>
            Recibimos una solicitud de registro para el Congreso UTVM.
          </p>

          <p>
            Ingresa el siguiente código en el formulario para confirmar tu registro:
          </p>

          <div
            style="
              display: inline-block;
              padding: 14px 22px;
              background: #031f1d;
              color: #00e0a4;
              border-radius: 8px;
              font-size: 28px;
              font-weight: bold;
              letter-spacing: 4px;
            "
          >
            ${codigo}
          </div>

          <p>
            Este código estará disponible durante 10 minutos.
          </p>

          <p>
            Si no solicitaste este registro, puedes ignorar este correo.
          </p>
        </div>
      `,
    });
  }
}