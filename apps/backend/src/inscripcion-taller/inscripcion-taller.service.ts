import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';

import { Taller } from '../taller/entities/taller.entity';
import { Externo } from '../externos/entities/externo.entity';
import { ParticipanteNsu } from '../registro-nsu/entities/participante-nsu.entity';

import { CrearInscripcionTallerDto } from './dto/crear-inscripcion-taller.dto';
import {
  InscripcionTaller,
  TipoParticipanteTaller,
} from './entities/inscripcion-taller.entity';

@Injectable()
export class InscripcionTallerService {
  constructor(
    @InjectRepository(InscripcionTaller)
    private readonly inscripcionRepository: Repository<InscripcionTaller>,

    @InjectRepository(Taller)
    private readonly tallerRepository: Repository<Taller>,

    @InjectRepository(Externo)
    private readonly externoRepository: Repository<Externo>,

    @InjectRepository(ParticipanteNsu)
    private readonly participanteNsuRepository: Repository<ParticipanteNsu>,

    private readonly dataSource: DataSource,
  ) {}

  async inscribir(dto: CrearInscripcionTallerDto) {
    await this.validarParticipante(dto.participanteId, dto.tipoParticipante);

    return this.dataSource.transaction(async (manager) => {
      const tallerRepository = manager.getRepository(Taller);
      const inscripcionRepository = manager.getRepository(InscripcionTaller);

      const taller = await tallerRepository
        .createQueryBuilder('taller')
        .setLock('pessimistic_write')
        .where('taller.id = :tallerId', {
          tallerId: dto.tallerId,
        })
        .andWhere('taller.deleted_at IS NULL')
        .getOne();

      if (!taller) {
        throw new NotFoundException('El taller no existe.');
      }

      const inscripcionExistente = await inscripcionRepository.findOne({
        where: {
          participante_id: dto.participanteId,
          tipo_participante: dto.tipoParticipante,
        },
        relations: {
          taller: true,
        },
      });

      if (inscripcionExistente) {
        if (inscripcionExistente.taller.id === dto.tallerId) {
          throw new ConflictException('Ya estás inscrito en este taller.');
        }

        throw new ConflictException('Solo puedes inscribirte en un taller.');
      }

      const inscritos = await inscripcionRepository.count({
        where: {
          taller: {
            id: dto.tallerId,
          },
        },
      });

      if (inscritos >= taller.cupo_maximo) {
        throw new ConflictException(
          'El taller ya no tiene lugares disponibles.',
        );
      }

      const inscripcion = inscripcionRepository.create({
        participante_id: dto.participanteId,
        tipo_participante: dto.tipoParticipante,
        taller,
      });

      const inscripcionGuardada = await inscripcionRepository.save(inscripcion);

      return {
        mensaje: 'Inscripción realizada correctamente.',
        inscripcion: {
          id: inscripcionGuardada.id,
          tallerId: taller.id,
          taller: taller.titulo,
          participanteId: dto.participanteId,
          tipoParticipante: dto.tipoParticipante,
          fechaInscripcion: inscripcionGuardada.created_at,
        },
      };
    });
  }

  private async validarParticipante(
    participanteId: string,
    tipoParticipante: TipoParticipanteTaller,
  ) {
    if (tipoParticipante === TipoParticipanteTaller.EXTERNO) {
      const externo = await this.externoRepository.findOne({
        where: {
          id: participanteId,
          deleted_at: IsNull(),
        },
      });

      if (!externo) {
        throw new NotFoundException('El participante externo no existe.');
      }

      if (!externo.correoVerificado) {
        throw new BadRequestException(
          'Debes verificar tu correo antes de inscribirte.',
        );
      }

      if (externo.status?.trim().toLowerCase() !== 'validado') {
        throw new BadRequestException(
          'Tu registro todavía no ha sido validado.',
        );
      }

      return;
    }

    if (tipoParticipante === TipoParticipanteTaller.NSU) {
      const participante = await this.participanteNsuRepository.findOne({
        where: {
          id: participanteId,
          deleted_at: IsNull(),
        },
      });

      if (!participante) {
        throw new NotFoundException('El participante NSU no existe.');
      }

      if (!participante.correo_verificado) {
        throw new BadRequestException(
          'Debes verificar tu correo antes de inscribirte.',
        );
      }

      if (participante.estado_pago?.trim().toUpperCase() !== 'VALIDADO') {
        throw new BadRequestException('Tu pago todavía no ha sido validado.');
      }

      return;
    }

    throw new BadRequestException('El tipo de participante no es válido.');
  }
}
