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
  randomUUID,
  timingSafeEqual,
} from 'crypto';

import {
  existsSync,
  mkdirSync,
  writeFileSync,
} from 'fs';

import {
  extname,
  join,
} from 'path';

import { Externo } from './entities/externo.entity';
import { CreateExternoDto } from './dto/create-externo.dto';
import { UpdateExternoDto } from './dto/update-externo.dto';
import { ArchivoComprobante } from '../registro-nsu/entities/archivo-comprobante.entity';

@Injectable()
export class ExternosService {
  constructor(
    @InjectRepository(Externo)
    private readonly externoRepository: Repository<Externo>,

    @InjectRepository(ArchivoComprobante)
    private readonly archivoRepository: Repository<ArchivoComprobante>,

    private readonly configService: ConfigService,
  ) {}

  async create(
    createExternoDto: CreateExternoDto,
    comprobante: Express.Multer.File,
  ) {
    const correoNormalizado =
      createExternoDto.correo.trim().toLowerCase();

    const correoExistente = await this.externoRepository.findOne({
      where: {
        correo: correoNormalizado,
      },
    });

    if (correoExistente) {
      throw new ConflictException(
        'Este correo ya fue registrado anteriormente. Revisa tu correo electrónico o usa uno diferente.',
      );
    }

    const archivoGuardado =
      await this.guardarArchivoComprobante(comprobante);

    const externo = this.externoRepository.create({
      ...createExternoDto,
      correo: correoNormalizado,
      institucion: createExternoDto.institucion || null,
      apellidoMaterno: createExternoDto.apellidoMaterno || null,
      comprobante: archivoGuardado,
      correoVerificado: false,
      status: 'pendiente_verificacion',
    });

    const externoGuardado =
      await this.externoRepository.save(externo);

    const verificationToken = this.crearTokenVerificacion(
      externoGuardado.id,
      externoGuardado.correo,
    );

    await this.enviarCorreoVerificacion(
      externoGuardado.correo,
      verificationToken,
    );

    return {
      mensaje:
        'Registro recibido. Revisa tu correo electrónico para verificarlo y finalizar el proceso.',
      id: externoGuardado.id,
      status: externoGuardado.status,
      correoVerificado: externoGuardado.correoVerificado,
    };
  }

  async verificarCorreo(token: string) {
    const payload = this.validarTokenVerificacion(token);

    const externo = await this.externoRepository.findOne({
      where: {
        id: payload.externoId,
        correo: payload.correo,
      },
    });

    if (!externo) {
      throw new BadRequestException(
        'No se encontró el registro asociado al enlace de verificación.',
      );
    }

    if (externo.correoVerificado) {
      return {
        mensaje: 'El correo ya se encontraba verificado.',
      };
    }

    externo.correoVerificado = true;
    externo.status = 'pendiente';

    await this.externoRepository.save(externo);

    return {
      mensaje: 'Correo verificado correctamente. Registro finalizado.',
    };
  }

  async findAll() {
    return await this.externoRepository.find({
      relations: {
        comprobante: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string) {
    const externo = await this.externoRepository.findOne({
      where: { id },
      relations: {
        comprobante: true,
      },
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

  private async guardarArchivoComprobante(
    comprobante: Express.Multer.File,
  ) {
    const uploadDir = join(
      process.cwd(),
      'uploads',
      'comprobantes',
    );

    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, {
        recursive: true,
      });
    }

    const extension = extname(comprobante.originalname);
    const nombreGuardado = `${randomUUID()}${extension}`;

    const rutaArchivoFisica = join(
      uploadDir,
      nombreGuardado,
    );

    const rutaRelativa =
      `uploads/comprobantes/${nombreGuardado}`;

    writeFileSync(
      rutaArchivoFisica,
      comprobante.buffer,
    );

    const archivo = this.archivoRepository.create({
      nombre_original: comprobante.originalname,
      nombre_guardado: nombreGuardado,
      ruta: rutaRelativa,
      mime_type: comprobante.mimetype,
      size: comprobante.size,
    });

    return await this.archivoRepository.save(archivo);
  }

  private crearTokenVerificacion(
    externoId: string,
    correo: string,
  ) {
    const secret =
      this.configService.get<string>('EMAIL_VERIFICATION_SECRET') ||
      'clave_temporal_desarrollo';

    const payload = {
      externoId,
      correo,
      expiraEn: Date.now() + 1000 * 60 * 60 * 24,
    };

    const payloadBase64 = Buffer
      .from(JSON.stringify(payload))
      .toString('base64url');

    const firma = createHmac('sha256', secret)
      .update(payloadBase64)
      .digest('base64url');

    return `${payloadBase64}.${firma}`;
  }

  private validarTokenVerificacion(token: string): {
    externoId: string;
    correo: string;
    expiraEn: number;
  } {
    if (!token) {
      throw new BadRequestException(
        'El enlace de verificación no es válido.',
      );
    }

    const secret =
      this.configService.get<string>('EMAIL_VERIFICATION_SECRET') ||
      'clave_temporal_desarrollo';

    const partes = token.split('.');

    if (partes.length !== 2) {
      throw new BadRequestException(
        'Enlace de verificación inválido.',
      );
    }

    const payloadBase64 = partes[0]!;
    const firmaRecibida = partes[1]!;

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
        'Enlace de verificación inválido.',
      );
    }

    const payload = JSON.parse(
      Buffer.from(payloadBase64, 'base64url').toString('utf8'),
    ) as {
      externoId: string;
      correo: string;
      expiraEn: number;
    };

    if (payload.expiraEn < Date.now()) {
      throw new BadRequestException(
        'El enlace de verificación expiró.',
      );
    }

    return payload;
  }

  private async enviarCorreoVerificacion(
    correo: string,
    verificationToken: string,
  ) {
    const mailHost = this.configService.get<string>('MAIL_HOST');

    const mailPort = Number(
      this.configService.get<string>('MAIL_PORT') || 465,
    );

    const mailUser = this.configService.get<string>('MAIL_USER');
    const mailPass = this.configService.get<string>('MAIL_PASS');

    const mailFrom =
      this.configService.get<string>('MAIL_FROM') || mailUser;

    const backendUrl =
      this.configService.get<string>('BACKEND_URL') ||
      'http://localhost:3000';

    const enlace =
      `${backendUrl}/api/externos/verificar-correo/${encodeURIComponent(verificationToken)}`;

    if (!mailHost || !mailUser || !mailPass) {
      console.warn(
        'Correo no configurado. Enlace de verificación:',
        enlace,
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
      subject: 'Confirma tu registro al Congreso UTVM',
      html: `
        <div style="font-family: Arial, sans-serif; color: #1d2b28;">
          <h2>Verificación de correo</h2>

          <p>
            Recibimos tu solicitud de registro para el Congreso UTVM.
          </p>

          <p>
            Para finalizar tu registro, confirma tu correo electrónico dando clic en el siguiente botón:
          </p>

          <p>
            <a
              href="${enlace}"
              style="
                display: inline-block;
                padding: 12px 18px;
                background: #00e0a4;
                color: #031f1d;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
              "
            >
              Confirmar registro
            </a>
          </p>

          <p>
            Este enlace estará disponible durante 24 horas.
          </p>

          <p>
            Si no solicitaste este registro, puedes ignorar este correo.
          </p>
        </div>
      `,
    });
  }
}