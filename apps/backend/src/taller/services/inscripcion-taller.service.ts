import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

import { ParticipanteAccesoService } from '../../participante-acceso/participante-acceso.service';
import { ParticipanteResolverService } from '../../participante-acceso/participante-resolver.service';
import { CreateInscripcionTallerDto } from '../dto/create-inscripcion-taller.dto';
import { InscripcionTaller } from '../entities/inscripcion-taller.entity';
import { Taller } from '../entities/taller.entity';

@Injectable()
export class InscripcionTallerService {
  private readonly timezone =
    process.env.CONGRESS_TIMEZONE ?? 'America/Mexico_City';

  constructor(
    private readonly dataSource: DataSource,
    private readonly resolver: ParticipanteResolverService,
    private readonly participantesAcceso: ParticipanteAccesoService,
  ) {}

  async create(
    tallerId: string,
    dto: CreateInscripcionTallerDto,
  ): Promise<InscripcionTaller> {
    return this.dataSource.transaction(async (manager) => {
      const taller = await this.lockTaller(manager, tallerId);
      if (!taller) throw new NotFoundException('Taller no encontrado');
      if (!taller.congreso) {
        throw new UnprocessableEntityException(
          'El taller no pertenece a un congreso',
        );
      }
      if (this.hasStarted(taller)) {
        throw new ConflictException('El taller ya inició');
      }

      await this.resolver.resolve(
        dto.tipoParticipante,
        dto.referenciaId,
        manager,
      );
      const participante = await this.participantesAcceso.findOrCreate(
        manager,
        {
          tipo: dto.tipoParticipante,
          referenciaId: dto.referenciaId,
          congresoId: taller.congreso.id,
        },
      );

      const existente = await manager.getRepository(InscripcionTaller).findOne({
        where: { participante: { id: participante.id } },
        relations: { taller: true },
      });
      if (existente) {
        const message =
          existente.taller.id === taller.id
            ? 'El participante ya está inscrito en este taller'
            : 'El participante ya está inscrito en otro taller del congreso';
        throw new ConflictException(message);
      }

      const inscritos = await manager.getRepository(InscripcionTaller).count({
        where: { taller: { id: taller.id } },
      });
      if (inscritos >= taller.cupo_maximo) {
        throw new ConflictException('El taller alcanzó su cupo máximo');
      }

      return manager.getRepository(InscripcionTaller).save(
        manager.getRepository(InscripcionTaller).create({
          taller,
          participante,
        }),
      );
    });
  }

  async findAll(tallerId: string): Promise<InscripcionTaller[]> {
    const taller = await this.dataSource.getRepository(Taller).findOneBy({
      id: tallerId,
    });
    if (!taller) throw new NotFoundException('Taller no encontrado');
    return this.dataSource.getRepository(InscripcionTaller).find({
      where: { taller: { id: tallerId } },
      relations: { participante: true },
      order: { created_at: 'ASC' },
    });
  }

  private lockTaller(
    manager: EntityManager,
    tallerId: string,
  ): Promise<Taller | null> {
    return manager
      .getRepository(Taller)
      .createQueryBuilder('taller')
      .leftJoinAndSelect('taller.congreso', 'congreso')
      .where('taller.id = :tallerId', { tallerId })
      .setLock('pessimistic_write', undefined, ['taller'])
      .getOne();
  }

  private hasStarted(taller: Taller): boolean {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: this.timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date());
    const value = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((part) => part.type === type)?.value ?? '';
    const now = `${value('year')}-${value('month')}-${value('day')} ${value('hour')}:${value('minute')}:${value('second')}`;
    const date =
      taller.fecha instanceof Date
        ? taller.fecha.toISOString().slice(0, 10)
        : taller.fecha;
    return `${date} ${taller.hora_inicio}` <= now;
  }
}
