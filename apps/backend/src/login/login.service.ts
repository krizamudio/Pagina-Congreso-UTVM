import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  randomBytes,
  randomInt,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto';

import { Externo } from '../externos/entities/externo.entity';
import { ParticipanteNsu } from '../registro-nsu/entities/participante-nsu.entity';
import { Ems } from '../ems/entities/ems.entity';
import { Utvm } from '../utvm/entities/utvm.entity';

import { CorreoService } from '../correo/correo.service';
import { CodigoLogin } from './entities/codigo-login.entity';

type TipoParticipante = 'EXTERNO' | 'NSU' | 'EMS' | 'UTVM';

@Injectable()
export class LoginService {
  private readonly MINUTOS_VIGENCIA = 5;
  private readonly MAX_INTENTOS = 5;

  constructor(
    @InjectRepository(Externo)
    private readonly externoRepository: Repository<Externo>,

    @InjectRepository(ParticipanteNsu)
    private readonly participanteNsuRepository: Repository<ParticipanteNsu>,

    @InjectRepository(Ems)
    private readonly emsRepository: Repository<Ems>,

    @InjectRepository(Utvm)
    private readonly utvmRepository: Repository<Utvm>,

    @InjectRepository(CodigoLogin)
    private readonly codigoLoginRepository: Repository<CodigoLogin>,

    private readonly correoService: CorreoService,
  ) {}

  /*
   * ============================================================
   * PRIMER PASO DEL LOGIN
   * ============================================================
   *
   * Recibe el correo.
   * Busca al participante.
   * Valida los requisitos correspondientes.
   * Genera y envía el código de 6 dígitos.
   *
   * IMPORTANTE:
   * Aquí todavía NO se autoriza el acceso.
   */
  async loginPorCorreo(correo: string) {
    const correoNormalizado = correo.trim().toLowerCase();

    /*
     * ============================================================
     * EXTERNO
     * ============================================================
     */
    const externo = await this.externoRepository
      .createQueryBuilder('externo')
      .where('LOWER(externo.correo) = :correo', {
        correo: correoNormalizado,
      })
      .andWhere('externo.deleted_at IS NULL')
      .getOne();

    if (externo) {
      if (!externo.correoVerificado) {
        throw new UnauthorizedException(
          'Debes verificar tu correo antes de iniciar sesión.',
        );
      }

      if (externo.status?.trim().toLowerCase() !== 'validado') {
        throw new UnauthorizedException(
          'Tu registro todavía no ha sido validado.',
        );
      }

      await this.generarYEnviarCodigo(
        externo.correo,
        'EXTERNO',
        String(externo.id),
      );

      return {
        mensaje: 'Se envió un código de verificación de 6 dígitos a tu correo.',
        requiereCodigo: true,
        minutosVigencia: this.MINUTOS_VIGENCIA,
      };
    }

    /*
     * ============================================================
     * NSU
     * ============================================================
     */
    const participanteNsu = await this.participanteNsuRepository
      .createQueryBuilder('participante')
      .leftJoinAndSelect('participante.registro', 'registro')
      .where('LOWER(participante.correo) = :correo', {
        correo: correoNormalizado,
      })
      .andWhere('participante.deleted_at IS NULL')
      .getOne();

    if (participanteNsu) {
      if (!participanteNsu.correo_verificado) {
        throw new UnauthorizedException(
          'Debes verificar tu correo antes de iniciar sesión.',
        );
      }

      if (participanteNsu.estado_pago?.trim().toUpperCase() !== 'VALIDADO') {
        throw new UnauthorizedException('Tu pago todavía no ha sido validado.');
      }

      await this.generarYEnviarCodigo(
        participanteNsu.correo,
        'NSU',
        String(participanteNsu.id),
      );

      return {
        mensaje: 'Se envió un código de verificación de 6 dígitos a tu correo.',
        requiereCodigo: true,
        minutosVigencia: this.MINUTOS_VIGENCIA,
      };
    }

    /*
     * ============================================================
     * EMS
     * ============================================================
     *
     * No requiere pago.
     * Únicamente debe existir el correo.
     */
    const participanteEms = await this.emsRepository
      .createQueryBuilder('ems')
      .where('LOWER(ems.correo) = :correo', {
        correo: correoNormalizado,
      })
      .andWhere('ems.deleted_at IS NULL')
      .getOne();

    if (participanteEms) {
      await this.generarYEnviarCodigo(
        participanteEms.correo,
        'EMS',
        String(participanteEms.id),
      );

      return {
        mensaje: 'Se envió un código de verificación de 6 dígitos a tu correo.',
        requiereCodigo: true,
        minutosVigencia: this.MINUTOS_VIGENCIA,
      };
    }

    /*
     * ============================================================
     * UTVM
     * ============================================================
     *
     * No requiere pago.
     * Únicamente debe existir el correo.
     */
    const participanteUtvm = await this.utvmRepository
      .createQueryBuilder('utvm')
      .where('LOWER(utvm.correo) = :correo', {
        correo: correoNormalizado,
      })
      .andWhere('utvm.deleted_at IS NULL')
      .getOne();

    if (participanteUtvm) {
      await this.generarYEnviarCodigo(
        participanteUtvm.correo,
        'UTVM',
        String(participanteUtvm.id),
      );

      return {
        mensaje: 'Se envió un código de verificación de 6 dígitos a tu correo.',
        requiereCodigo: true,
        minutosVigencia: this.MINUTOS_VIGENCIA,
      };
    }

    /*
     * ============================================================
     * NO ENCONTRADO
     * ============================================================
     */
    throw new UnauthorizedException('El correo no se encuentra registrado.');
  }

  /*
   * ============================================================
   * SEGUNDO PASO DEL LOGIN
   * ============================================================
   *
   * El usuario proporciona:
   *
   * correo + código de 6 dígitos
   *
   * Aquí sí se autoriza el acceso si el código es correcto.
   */
  async verificarCodigo(correo: string, codigo: string) {
    const correoNormalizado = correo.trim().toLowerCase();
    const codigoNormalizado = codigo.trim();

    /*
     * Validamos que sean exactamente 6 números.
     */
    if (!/^\d{6}$/.test(codigoNormalizado)) {
      throw new UnauthorizedException('El código debe contener 6 dígitos.');
    }

    /*
     * Buscamos el código activo más reciente.
     */
    const registroCodigo = await this.codigoLoginRepository.findOne({
      where: {
        correo: correoNormalizado,
        utilizado: false,
      },
      order: {
        created_at: 'DESC',
      },
    });

    if (!registroCodigo) {
      throw new UnauthorizedException('No existe un código de acceso activo.');
    }

    /*
     * Comprobamos la expiración.
     */
    if (registroCodigo.expira_en.getTime() < Date.now()) {
      registroCodigo.utilizado = true;

      await this.codigoLoginRepository.save(registroCodigo);

      throw new UnauthorizedException('El código de verificación ha expirado.');
    }

    /*
     * Comprobamos que todavía tenga intentos disponibles.
     */
    if (registroCodigo.intentos >= this.MAX_INTENTOS) {
      registroCodigo.utilizado = true;

      await this.codigoLoginRepository.save(registroCodigo);

      throw new UnauthorizedException(
        'Se excedió el número máximo de intentos.',
      );
    }

    /*
     * Comparamos el código escrito por el usuario
     * contra el hash almacenado.
     */
    const codigoCorrecto = this.compararCodigo(
      codigoNormalizado,
      registroCodigo.codigo_hash,
    );

    if (!codigoCorrecto) {
      registroCodigo.intentos += 1;

      /*
       * Si este fue el quinto intento incorrecto,
       * inutilizamos definitivamente el código.
       */
      if (registroCodigo.intentos >= this.MAX_INTENTOS) {
        registroCodigo.utilizado = true;
      }

      await this.codigoLoginRepository.save(registroCodigo);

      if (registroCodigo.utilizado) {
        throw new UnauthorizedException(
          'Se excedió el número máximo de intentos. Solicita un nuevo código.',
        );
      }

      throw new UnauthorizedException(
        `Código incorrecto. Intentos restantes: ${
          this.MAX_INTENTOS - registroCodigo.intentos
        }.`,
      );
    }

    /*
     * El código es correcto.
     * Se marca inmediatamente como utilizado.
     */
    registroCodigo.utilizado = true;

    await this.codigoLoginRepository.save(registroCodigo);

    /*
     * Recuperamos al participante correspondiente
     * y ahora sí autorizamos el inicio de sesión.
     */
    return this.obtenerParticipanteAutorizado(
      registroCodigo.tipo_participante as TipoParticipante,
      registroCodigo.participante_id,
    );
  }

  /*
   * ============================================================
   * GENERAR Y ENVIAR OTP
   * ============================================================
   */
  private async generarYEnviarCodigo(
    correo: string,
    tipoParticipante: TipoParticipante,
    participanteId: string,
  ): Promise<void> {
    const correoNormalizado = correo.trim().toLowerCase();

    /*
     * Inutilizamos cualquier código anterior que
     * todavía estuviera activo para este correo.
     */
    await this.codigoLoginRepository.update(
      {
        correo: correoNormalizado,
        utilizado: false,
      },
      {
        utilizado: true,
      },
    );

    /*
     * Generamos un número entre:
     *
     * 100000 y 999999
     */
    const codigo = this.generarCodigo();

    /*
     * Nunca guardamos el código directamente.
     */
    const codigoHash = this.crearHashCodigo(codigo);

    /*
     * Calculamos la expiración.
     */
    const expiraEn = new Date(Date.now() + this.MINUTOS_VIGENCIA * 60 * 1000);

    const registro = this.codigoLoginRepository.create({
      correo: correoNormalizado,
      tipo_participante: tipoParticipante,
      participante_id: participanteId,
      codigo_hash: codigoHash,
      expira_en: expiraEn,
      utilizado: false,
      intentos: 0,
    });

    const registroGuardado = await this.codigoLoginRepository.save(registro);

    try {
      /*
       * Utilizamos el CorreoService que ya existe
       * en el proyecto.
       */
      await this.correoService.enviarCodigoLogin(
        correoNormalizado,
        codigo,
        this.MINUTOS_VIGENCIA,
      );
    } catch (error) {
      /*
       * Si el correo no pudo enviarse,
       * inutilizamos el código que acabamos de crear.
       */
      registroGuardado.utilizado = true;

      await this.codigoLoginRepository.save(registroGuardado);

      throw error;
    }
  }

  /*
   * ============================================================
   * GENERACIÓN DEL CÓDIGO
   * ============================================================
   */
  private generarCodigo(): string {
    return randomInt(100000, 1000000).toString();
  }

  /*
   * ============================================================
   * HASH DEL CÓDIGO
   * ============================================================
   *
   * Generamos un salt diferente para cada OTP.
   *
   * Lo almacenado tendrá aproximadamente esta forma:
   *
   * salt:hash
   */
  private crearHashCodigo(codigo: string): string {
    const salt = randomBytes(16).toString('hex');

    const hash = scryptSync(codigo, salt, 64).toString('hex');

    return `${salt}:${hash}`;
  }

  /*
   * ============================================================
   * COMPARACIÓN SEGURA DEL CÓDIGO
   * ============================================================
   */
  private compararCodigo(codigo: string, codigoHashGuardado: string): boolean {
    const [salt, hashGuardado] = codigoHashGuardado.split(':');

    if (!salt || !hashGuardado) {
      return false;
    }

    const hashIngresado = scryptSync(codigo, salt, 64);

    const hashGuardadoBuffer = Buffer.from(hashGuardado, 'hex');

    if (hashIngresado.length !== hashGuardadoBuffer.length) {
      return false;
    }

    return timingSafeEqual(hashIngresado, hashGuardadoBuffer);
  }

  /*
   * ============================================================
   * RECUPERAR PARTICIPANTE DESPUÉS DEL OTP
   * ============================================================
   */
  private async obtenerParticipanteAutorizado(
    tipo: TipoParticipante,
    participanteId: string,
  ) {
    /*
     * ============================================================
     * EXTERNO
     * ============================================================
     */
    if (tipo === 'EXTERNO') {
      const externo = await this.externoRepository.findOne({
        where: {
          id: participanteId,
        },
      });

      if (!externo) {
        throw new UnauthorizedException(
          'El participante ya no se encuentra disponible.',
        );
      }

      /*
       * Volvemos a validar su estado por seguridad.
       */
      if (!externo.correoVerificado) {
        throw new UnauthorizedException(
          'El correo del participante no está verificado.',
        );
      }

      if (externo.status?.trim().toLowerCase() !== 'validado') {
        throw new UnauthorizedException(
          'Tu registro todavía no ha sido validado.',
        );
      }

      return {
        mensaje: 'Acceso autorizado.',
        tipo: 'EXTERNO',
        participante: {
          id: externo.id,
          nombreCompleto: [
            externo.nombre,
            externo.apellidoPaterno,
            externo.apellidoMaterno,
          ]
            .filter(Boolean)
            .join(' '),
          correo: externo.correo,
          institucion: externo.institucion,
        },
      };
    }

    /*
     * ============================================================
     * NSU
     * ============================================================
     */
    if (tipo === 'NSU') {
      const participanteNsu = await this.participanteNsuRepository
        .createQueryBuilder('participante')
        .leftJoinAndSelect('participante.registro', 'registro')
        .where('participante.id = :id', {
          id: participanteId,
        })
        .andWhere('participante.deleted_at IS NULL')
        .getOne();

      if (!participanteNsu) {
        throw new UnauthorizedException(
          'El participante ya no se encuentra disponible.',
        );
      }

      /*
       * Volvemos a validar por seguridad.
       */
      if (!participanteNsu.correo_verificado) {
        throw new UnauthorizedException(
          'El correo del participante no está verificado.',
        );
      }

      if (participanteNsu.estado_pago?.trim().toUpperCase() !== 'VALIDADO') {
        throw new UnauthorizedException('Tu pago todavía no ha sido validado.');
      }

      return {
        mensaje: 'Acceso autorizado.',
        tipo: 'NSU',
        participante: {
          id: participanteNsu.id,
          registroId: participanteNsu.registro?.id ?? null,
          nombreCompleto: participanteNsu.nombre_completo,
          correo: participanteNsu.correo,
          institucion: participanteNsu.institucion,
          carrera: participanteNsu.carrera,
        },
      };
    }

    /*
     * ============================================================
     * EMS
     * ============================================================
     */
    if (tipo === 'EMS') {
      const participanteEms = await this.emsRepository
        .createQueryBuilder('ems')
        .where('ems.id = :id', {
          id: Number(participanteId),
        })
        .andWhere('ems.deleted_at IS NULL')
        .getOne();

      if (!participanteEms) {
        throw new UnauthorizedException(
          'El participante ya no se encuentra disponible.',
        );
      }

      return {
        mensaje: 'Acceso autorizado.',
        tipo: 'EMS',
        participante: {
          id: String(participanteEms.id),
          nombreCompleto: [
            participanteEms.nombres,
            participanteEms.apellidoPaterno,
            participanteEms.apellidoMaterno,
          ]
            .filter(Boolean)
            .join(' '),
          correo: participanteEms.correo,
          institucion: participanteEms.institucion,
          carrera: participanteEms.carrera,
          telefono: participanteEms.telefono,
        },
      };
    }

    /*
     * ============================================================
     * UTVM
     * ============================================================
     */
    if (tipo === 'UTVM') {
      const participanteUtvm = await this.utvmRepository
        .createQueryBuilder('utvm')
        .where('utvm.id = :id', {
          id: Number(participanteId),
        })
        .andWhere('utvm.deleted_at IS NULL')
        .getOne();

      if (!participanteUtvm) {
        throw new UnauthorizedException(
          'El participante ya no se encuentra disponible.',
        );
      }

      return {
        mensaje: 'Acceso autorizado.',
        tipo: 'UTVM',
        participante: {
          id: String(participanteUtvm.id),
          nombreCompleto: [
            participanteUtvm.nombres,
            participanteUtvm.apellidoPaterno,
            participanteUtvm.apellidoMaterno,
          ]
            .filter(Boolean)
            .join(' '),
          correo: participanteUtvm.correo,
          cuatrimestre: participanteUtvm.cuatrimestre,
          grupo: participanteUtvm.grupo,
          telefono: participanteUtvm.telefono,
        },
      };
    }

    throw new UnauthorizedException('Tipo de participante inválido.');
  }
}
