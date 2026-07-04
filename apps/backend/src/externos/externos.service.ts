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

  async enviarVerificacionCorreo(correo: string) {
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

    const verificationToken =
      this.crearTokenVerificacion(correoNormalizado);

    await this.enviarCorreoVerificacion(
      correoNormalizado,
      verificationToken,
    );

    return {
      mensaje:
        'Correo de verificación enviado. Revisa tu correo electrónico para continuar.',
    };
  }

  async create(
    createExternoDto: CreateExternoDto,
    comprobante: Express.Multer.File,
  ) {
    const {
      verificationToken,
      ...datosRegistro
    } = createExternoDto;

    const correoNormalizado =
      datosRegistro.correo.trim().toLowerCase();

    this.validarTokenVerificacion(
      verificationToken,
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

    const archivoGuardado =
      await this.guardarArchivoComprobante(comprobante);

    const externo = this.externoRepository.create({
      ...datosRegistro,
      correo: correoNormalizado,
      institucion: datosRegistro.institucion || null,
      apellidoMaterno: datosRegistro.apellidoMaterno || null,
      comprobante: archivoGuardado,
      correoVerificado: true,
      status: 'pendiente',
    });

    return await this.externoRepository.save(externo);
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

    /*
      Esta ruta se usa solo para guardar físicamente el archivo.
      Puede ser absoluta porque es para el servidor.
    */
    const rutaArchivoFisica = join(
      uploadDir,
      nombreGuardado,
    );

    /*
      Esta ruta es la que se guarda en la base de datos.
      Es relativa para no depender de C:\Users\brian\...
    */
    const rutaRelativa = `uploads/comprobantes/${nombreGuardado}`;

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

  private crearTokenVerificacion(correo: string) {
    const secret =
      this.configService.get<string>('EMAIL_VERIFICATION_SECRET') ||
      'clave_temporal_desarrollo';

    const payload = {
      correo,
      expiraEn: Date.now() + 1000 * 60 * 30,
    };

    const payloadBase64 = Buffer
      .from(JSON.stringify(payload))
      .toString('base64url');

    const firma = createHmac('sha256', secret)
      .update(payloadBase64)
      .digest('base64url');

    return `${payloadBase64}.${firma}`;
  }

  private validarTokenVerificacion(
    token: string,
    correo: string,
  ) {
    if (!token) {
      throw new BadRequestException(
        'Por favor ingresa a tu correo electrónico y verifica tu registro antes de continuar.',
      );
    }

    const secret =
      this.configService.get<string>('EMAIL_VERIFICATION_SECRET') ||
      'clave_temporal_desarrollo';

    const partes = token.split('.');

    if (partes.length !== 2) {
      throw new BadRequestException(
        'Verificación de correo inválida. Solicita un nuevo enlace.',
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
        'Verificación de correo inválida. Solicita un nuevo enlace.',
      );
    }

    const payload = JSON.parse(
      Buffer.from(payloadBase64, 'base64url').toString('utf8'),
    ) as {
      correo: string;
      expiraEn: number;
    };

    if (payload.correo !== correo) {
      throw new BadRequestException(
        'El enlace de verificación no corresponde a este correo.',
      );
    }

    if (payload.expiraEn < Date.now()) {
      throw new BadRequestException(
        'El enlace de verificación expiró. Solicita uno nuevo.',
      );
    }
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

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ||
      'http://localhost:9000';

    const enlace =
      `${frontendUrl}/#/registro-externo?correo=${encodeURIComponent(correo)}&verificationToken=${encodeURIComponent(verificationToken)}`;

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
      subject: 'Confirmación de correo para tu registro al Congreso UTVM',
      html: `
        <div style="font-family: Arial, sans-serif; color: #1d2b28;">
          <h2>Verificación de correo</h2>

          <p>
            Recibimos una solicitud de registro para el Congreso UTVM.
          </p>

          <p>
            Para continuar con tu registro, verifica tu correo electrónico dando clic en el siguiente botón:
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
              Verificar correo
            </a>
          </p>

          <p>
            Este enlace estará disponible durante 30 minutos.
          </p>

          <p>
            Si no solicitaste este registro, puedes ignorar este correo.
          </p>
        </div>
      `,
    });
  }
}