import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Externo } from '../externos/entities/externo.entity';
import { ParticipanteNsu } from '../registro-nsu/entities/participante-nsu.entity';
import { Ems } from '../ems/entities/ems.entity';
import { Utvm } from '../utvm/entities/utvm.entity';

@Injectable()
export class LoginService {
  constructor(
    @InjectRepository(Externo)
    private readonly externoRepository: Repository<Externo>,

    @InjectRepository(ParticipanteNsu)
    private readonly participanteNsuRepository: Repository<ParticipanteNsu>,

    @InjectRepository(Ems)
    private readonly emsRepository: Repository<Ems>,

    @InjectRepository(Utvm)
    private readonly utvmRepository: Repository<Utvm>,
  ) {}

  async loginPorCorreo(correo: string) {
    const correoNormalizado = correo.trim().toLowerCase();

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

    const participanteEms = await this.emsRepository
      .createQueryBuilder('ems')
      .where('LOWER(ems.correo) = :correo', {
        correo: correoNormalizado,
      })
      .andWhere('ems.deleted_at IS NULL')
      .getOne();

    if (participanteEms) {
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

    const participanteUtvm = await this.utvmRepository
      .createQueryBuilder('utvm')
      .where('LOWER(utvm.correo) = :correo', {
        correo: correoNormalizado,
      })
      .andWhere('utvm.deleted_at IS NULL')
      .getOne();

    if (participanteUtvm) {
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

    throw new UnauthorizedException('El correo no se encuentra registrado.');
  }
}