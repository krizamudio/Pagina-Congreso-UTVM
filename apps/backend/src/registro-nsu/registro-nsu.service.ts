import { BadRequestException, ConflictException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { createHmac, randomUUID, timingSafeEqual } from 'crypto';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { extname, join } from 'path';
import { In, Repository, IsNull, Not } from 'typeorm';
import { CreateRegistroNsuDto } from './dto/create-registro-nsu.dto';
import { UpdateRegistroNsuDto } from './dto/update-registro-nsu.dto';
import { UpdateParticipanteNsuStatusDto } from './dto/update-participante-nsu-status.dto';
import { ArchivoComprobante } from './entities/archivo-comprobante.entity';
import { ParticipanteNsu } from './entities/participante-nsu.entity';
import { RegistroNsu } from './entities/registro-nsu.entity';
import { GeneradorCommon } from '../common/generador.common';

@Injectable()
export class RegistroNsuService {
  private readonly registroActionLocks = new Map<string, Promise<void>>();
  constructor(
    @Inject('REGISTRO_NSU_REPOSITORY')
    private readonly registroRepository: Repository<RegistroNsu>,

    @Inject('PARTICIPANTE_NSU_REPOSITORY')
    private readonly participanteRepository: Repository<ParticipanteNsu>,

    @Inject('ARCHIVO_COMPROBANTE_REPOSITORY')
    private readonly archivoRepository: Repository<ArchivoComprobante>,

    private readonly configService: ConfigService,
    private readonly generador: GeneradorCommon,
  ) {}

  async create(createRegistroNsuDto: CreateRegistroNsuDto) {
    const participantesDto = createRegistroNsuDto.participantes ?? [];
    const comprobante = createRegistroNsuDto.comprobante;

    if (participantesDto.length === 0) {
      throw new BadRequestException('Debe registrar al menos un participante.');
    }

    if (!comprobante) {
      throw new BadRequestException('El comprobante de pago es obligatorio.');
    }

    const correos = participantesDto.map((p) => p.correo.trim().toLowerCase());

    const correosUnicos = new Set(correos);
    if (correos.length !== correosUnicos.size) {
      throw new BadRequestException(
        'No se permiten correos duplicados entre participantes.',
      );
    }

    const participantesExistentes = await this.participanteRepository.find({
      where: {
        correo: In(correos),
        deleted_at: IsNull(),
      },
      select: {
        correo: true,
      },
    });

    if (participantesExistentes.length > 0) {
      const correosDuplicados = [
        ...new Set(
          participantesExistentes.map((participante) =>
            participante.correo.toLowerCase(),
          ),
        ),
      ];

      throw new BadRequestException(
        `Los siguientes correos ya se encuentran registrados: ${correosDuplicados.join(', ')}`,
      );
    }

    participantesDto.forEach((participante, index) => {
      const numeroParticipante = index + 1;

      if (!participante.nombreCompleto?.trim()) {
        throw new BadRequestException(
          `El nombre del participante ${numeroParticipante} es obligatorio.`,
        );
      }

      if (!participante.correo?.trim()) {
        throw new BadRequestException(
          `El correo del participante ${numeroParticipante} es obligatorio.`,
        );
      }

      if (!participante.institucion?.trim()) {
        throw new BadRequestException(
          `La institución del participante ${numeroParticipante} es obligatoria.`,
        );
      }

      if (!participante.carrera?.trim()) {
        throw new BadRequestException(
          `La carrera del participante ${numeroParticipante} es obligatoria.`,
        );
      }

      if (!participante.telefono?.trim()) {
        throw new BadRequestException(
          `El teléfono del participante ${numeroParticipante} es obligatorio.`,
        );
      }

      if (!/^\d{10}$/.test(participante.telefono)) {
        throw new BadRequestException(
          `El teléfono del participante ${numeroParticipante} debe tener 10 dígitos.`,
        );
      }

      if (!participante.dias?.trim()) {
        throw new BadRequestException(
          `Debe seleccionar al menos un día para el participante ${numeroParticipante}.`,
        );
      }

      const diasCantidad = participante.dias
        .split(',')
        .map((dia) => dia.trim())
        .filter(Boolean).length;

      const montoEsperado = diasCantidad * 100;

      if (Number(participante.montoNumero) !== montoEsperado) {
        throw new BadRequestException(
          `El monto del participante ${numeroParticipante} no coincide con los días seleccionados.`,
        );
      }
    });

    const uploadDir = join(process.cwd(), 'uploads', 'comprobantes');

    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    const extension = extname(comprobante.originalname);
    const nombreGuardado = `${randomUUID()}${extension}`;
    const rutaArchivo = join(uploadDir, nombreGuardado);

    writeFileSync(rutaArchivo, comprobante.buffer);

    const archivo = this.archivoRepository.create({
      nombre_original: comprobante.originalname,
      nombre_guardado: nombreGuardado,
      ruta: rutaArchivo,
      mime_type: comprobante.mimetype,
      size: comprobante.size,
    });

    const archivoGuardado = await this.archivoRepository.save(archivo);

    const totalGeneral = participantesDto.reduce((total, participante) => {
      return total + Number(participante.montoNumero || 0);
    }, 0);

    const registro = this.registroRepository.create({
      total_general: totalGeneral,
      total_participantes: participantesDto.length,
      estado_pago: 'PENDIENTE',
      comprobante: archivoGuardado,
    });

    const registroGuardado = await this.registroRepository.save(registro);

    const participantes = participantesDto.map((participante, index) => {
      return this.participanteRepository.create({
        registro: registroGuardado,
        es_tutor: index === 0,
        correo_verificado: false,
        nombre_completo: participante.nombreCompleto.trim(),
        correo: participante.correo.trim().toLowerCase(),
        institucion: participante.institucion.trim(),
        carrera: participante.carrera.trim(),
        telefono: participante.telefono.trim(),
        dias: participante.dias,
        monto_individual: participante.montoNumero,
        estado_pago: 'PENDIENTE',
      });
    });

    const participantesGuardados =
      await this.participanteRepository.save(participantes);

    for (const participante of participantesGuardados) {
      const verificationToken = this.crearTokenVerificacionParticipante(
        participante.id,
        participante.correo,
      );

      await this.enviarCorreoVerificacionParticipante(
        participante.correo,
        verificationToken,
      );
    }

    return this.findOne(registroGuardado.id);
  }

  async verificarCorreoParticipante(token: string) {
    const payload = this.validarTokenParticipante(token);

    const participante = await this.participanteRepository.findOne({
      where: {
        id: payload.participanteId,
        correo: payload.correo,
        deleted_at: IsNull(),
      },
    });

    if (!participante) {
      throw new BadRequestException(
        'No se encontró el participante asociado al enlace de verificación.',
      );
    }

    if (participante.correo_verificado) {
      return {
        mensaje: 'El correo ya se encontraba verificado.',
      };
    }

    participante.correo_verificado = true;
    await this.participanteRepository.save(participante);

    return {
      mensaje: 'Correo verificado correctamente.',
    };
  }

  private crearTokenVerificacionParticipante(
    participanteId: string,
    correo: string,
  ) {
    const secret =
      this.configService.get<string>('EMAIL_VERIFICATION_SECRET') ||
      'clave_temporal_desarrollo';

    const payload = {
      participanteId,
      correo,
      expiraEn: Date.now() + 1000 * 60 * 60 * 24, // 24 horas
    };

    const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString(
      'base64url',
    );

    const firma = createHmac('sha256', secret)
      .update(payloadBase64)
      .digest('base64url');

    return `${payloadBase64}.${firma}`;
  }

  private validarTokenParticipante(token: string): {
    participanteId: string;
    correo: string;
    expiraEn: number;
  } {
    const secret =
      this.configService.get<string>('EMAIL_VERIFICATION_SECRET') ||
      'clave_temporal_desarrollo';

    const partes = token.split('.');

    if (partes.length !== 2) {
      throw new BadRequestException('Enlace de verificación inválido.');
    }

    const [payloadBase64, firmaRecibida] = partes;

    const firmaEsperada = createHmac('sha256', secret)
      .update(payloadBase64)
      .digest('base64url');

    const firmaRecibidaBuffer = Buffer.from(firmaRecibida);
    const firmaEsperadaBuffer = Buffer.from(firmaEsperada);

    if (
      firmaRecibidaBuffer.length !== firmaEsperadaBuffer.length ||
      !timingSafeEqual(firmaRecibidaBuffer, firmaEsperadaBuffer)
    ) {
      throw new BadRequestException('Enlace de verificación inválido.');
    }

    const payload = JSON.parse(
      Buffer.from(payloadBase64, 'base64url').toString('utf8'),
    ) as {
      participanteId: string;
      correo: string;
      expiraEn: number;
    };

    if (payload.expiraEn < Date.now()) {
      throw new BadRequestException('El enlace de verificación expiró.');
    }

    return payload;
  }

  private async enviarCorreoVerificacionParticipante(
    correo: string,
    verificationToken: string,
  ) {
    const mailHost = this.configService.get<string>('MAIL_HOST');
    const mailPort = Number(this.configService.get<string>('MAIL_PORT') || 465);
    const mailUser = this.configService.get<string>('MAIL_USER');
    const mailPass = this.configService.get<string>('MAIL_PASS');
    const mailFrom = this.configService.get<string>('MAIL_FROM') || mailUser;

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:9000';

    const enlace = `${frontendUrl}/#/registro_nsu/verificar?token=${encodeURIComponent(verificationToken)}`;

    if (!mailHost || !mailUser || !mailPass) {
      console.warn('Correo no configurado. Enlace de verificación:', enlace);
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
      subject: 'Verificación de correo para registro NSU',
      html: `
        <div style="font-family: Arial, sans-serif; color: #1d2b28;">
          <h2>Verificación de correo</h2>
          <p>Se registró tu correo en el Congreso UTVM.</p>
          <p>Para confirmar tu participación, verifica tu correo dando clic en el siguiente botón:</p>
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
          <p>Este enlace estará disponible durante 24 horas.</p>
          <p>Si no reconoces este registro, puedes ignorar este mensaje.</p>
        </div>
      `,
    });
  }

  async findAll() {
    return this.registroRepository
      .createQueryBuilder('registro')
      .leftJoinAndSelect('registro.participantes', 'participante', 'participante.deleted_at IS NULL')
      .leftJoinAndSelect('registro.comprobante', 'comprobante')
      .where('registro.deleted_at IS NULL')
      .orderBy('registro.created_at', 'DESC')
      .getMany();
  }

  async findOne(id: string) {
    return this.registroRepository
      .createQueryBuilder('registro')
      .leftJoinAndSelect('registro.participantes', 'participante', 'participante.deleted_at IS NULL')
      .leftJoinAndSelect('registro.comprobante', 'comprobante')
      .where('registro.id = :id', { id })
      .andWhere('registro.deleted_at IS NULL')
      .getOne();
  }

  private async runRegistroAction<T>(registroId: string, action: () => Promise<T>) {
    const previousAction = this.registroActionLocks.get(registroId) ?? Promise.resolve();
    let releaseCurrentAction!: () => void;

    const currentAction = new Promise<void>((resolve) => {
      releaseCurrentAction = resolve;
    });

    const queuedAction = previousAction
      .catch(() => undefined)
      .then(() => currentAction);

    this.registroActionLocks.set(registroId, queuedAction);

    await previousAction.catch(() => undefined);

    try {
      return await action();
    } finally {
      releaseCurrentAction();

      if (this.registroActionLocks.get(registroId) === queuedAction) {
        this.registroActionLocks.delete(registroId);
      }
    }
  }

  async update(id: string, updateRegistroNsuDto: UpdateRegistroNsuDto) {
    return this.runRegistroAction(id, async () => {
      await this.ensureRegistroExists(id);

      if (updateRegistroNsuDto.estado_pago) {
        await this.aplicarEstadoATodosParticipantes(
          id,
          updateRegistroNsuDto.estado_pago,
        );

        await this.registroRepository.update(id, {
          estado_pago: updateRegistroNsuDto.estado_pago,
        });
      }

      return this.findOne(id);
    });
  }

  async updateParticipanteStatus(
    registroId: string,
    participanteId: string,
    updateParticipanteNsuStatusDto: UpdateParticipanteNsuStatusDto,
  ) {
    return this.runRegistroAction(registroId, async () => {
      await this.ensureRegistroExists(registroId);

      const participante = await this.participanteRepository.findOne({
        where: {
          id: participanteId,
          registro: { id: registroId },
          deleted_at: IsNull(),
        },
      });

      if (!participante) {
        throw new BadRequestException('Participante NSU no encontrado');
      }

      await this.participanteRepository.update(participante.id, {
        estado_pago: updateParticipanteNsuStatusDto.estado_pago,
      });
      await this.sincronizarEstadoRegistro(registroId);

      return this.findOne(registroId);
    });
  }

  async removeParticipante(registroId: string, participanteId: string) {
    return this.runRegistroAction(registroId, async () => {
      await this.ensureRegistroExists(registroId);

      const participante = await this.participanteRepository.findOne({
        where: {
          id: participanteId,
          registro: { id: registroId },
          deleted_at: IsNull(),
        },
      });

      if (!participante) {
        throw new BadRequestException('Participante NSU no encontrado');
      }

      await this.participanteRepository.update(participante.id, {
        correo_original: participante.correo_original ?? participante.correo,
        correo: this.generador.CorreoEliminado(),
      });
      await this.participanteRepository.softDelete(participante.id);
      await this.recalcularTotalesRegistro(registroId);
      await this.sincronizarEstadoRegistro(registroId);

      return this.findOne(registroId);
    });
  }

  private async aplicarEstadoATodosParticipantes(
    registroId: string,
    estadoPago: string,
  ) {
    const participantes = await this.getParticipantesActivos(registroId);

    if (participantes.length === 0) {
      return;
    }

    await this.participanteRepository.update(
      { id: In(participantes.map((participante) => participante.id)) },
      { estado_pago: estadoPago },
    );
  }

  private async sincronizarEstadoRegistro(id: string) {
    const registro = await this.ensureRegistroExists(id);
    const participantes = await this.getParticipantesActivos(id);

    await this.registroRepository.update(id, {
      estado_pago: this.calcularEstadoRegistro(participantes),
    });
  }

  private async getParticipantesActivos(registroId: string) {
    return this.participanteRepository.find({
      where: {
        registro: { id: registroId },
        deleted_at: IsNull(),
      },
    });
  }

  private calcularEstadoRegistro(participantes: ParticipanteNsu[]) {
    if (participantes.length === 0) {
      return 'PENDIENTE';
    }

    const estados = new Set(
      participantes.map((participante) => participante.estado_pago),
    );

    if (estados.size === 1) {
      return estados.values().next().value as string;
    }

    return 'PENDIENTE';
  }

  private async ensureRegistroExists(id: string) {
    const registro = await this.registroRepository.findOne({
      where: { id, deleted_at: IsNull() },
      select: { id: true },
    });

    if (!registro) {
      throw new BadRequestException('Registro NSU no encontrado');
    }

    return registro;
  }

  private async recalcularTotalesRegistro(id: string) {
    const registro = await this.ensureRegistroExists(id);

    const participantes = await this.participanteRepository.find({
      where: {
        registro: { id },
        deleted_at: IsNull(),
      },
    });

    registro.total_participantes = participantes.length;
    registro.total_general = participantes.reduce((total, participante) => {
      return total + Number(participante.monto_individual || 0);
    }, 0);

    await this.registroRepository.update(id, {
      total_participantes: registro.total_participantes,
      total_general: registro.total_general,
    });
  }

  //Equipo 2 -> funcion de eliminar y restaurar RF-13

  async remove(id: string) {
    return this.runRegistroAction(id, async () => {
      const registro = await this.findOne(id);

    if (!registro) {
      throw new BadRequestException('Registro NSU no encontrado');
    }

    const participantes = await this.participanteRepository.find({
      where: {
        registro: { id },
        deleted_at: IsNull(),
      },
    });

    if (participantes.length > 0) {
      for (const participante of participantes) {
        await this.participanteRepository.update(participante.id, {
          correo_original: participante.correo_original ?? participante.correo,
          correo: this.generador.CorreoEliminado(),
        });
      }

      await this.participanteRepository.softDelete({
        id: In(participantes.map((participante) => participante.id)),
      });
    }

    await this.registroRepository.softDelete(id);

      return registro;
    });
  }

  async restore(id: string) {
    return this.runRegistroAction(id, async () => {
    const registro = await this.registroRepository.findOne({
      where: { id },
      relations: {
        participantes: true,
        comprobante: true,
      },
      withDeleted: true,
    });

    if (!registro) {
      throw new BadRequestException('Registro NSU no encontrado');
    }

    const participantes = await this.participanteRepository.find({
      where: { registro: { id } },
      withDeleted: true,
    });

    const participanteIds = participantes.map((participante) => participante.id);
    const correosRestaurados = participantes
      .map((participante) => participante.correo_original ?? participante.correo)
      .filter(Boolean);

    if (correosRestaurados.length > 0) {
      const correosEnUso = await this.participanteRepository.find({
        where: {
          id: Not(In(participanteIds)),
          correo: In(correosRestaurados),
          deleted_at: IsNull(),
        },
        select: {
          correo: true,
        },
      });

      if (correosEnUso.length > 0) {
        const correosDuplicados = [
          ...new Set(correosEnUso.map((participante) => participante.correo)),
        ];

        throw new ConflictException(
          `No se puede restaurar el registro porque estos correos ya están en uso: ${correosDuplicados.join(', ')}`,
        );
      }
    }

    await this.registroRepository.restore(id);

    if (participanteIds.length > 0) {
      await this.participanteRepository.restore({ id: In(participanteIds) });

      for (const participante of participantes) {
        await this.participanteRepository.update(participante.id, {
          correo: participante.correo_original ?? participante.correo,
          correo_original: null,
        });
      }
    }

      return this.findOne(id);
    });
  }
}
