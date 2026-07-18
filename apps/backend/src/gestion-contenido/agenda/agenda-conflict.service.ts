import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { Conferencia } from '../../conferencia/entities/conferencia.entity';
import { Taller } from '../../taller/entities/taller.entity';
import { AgendaSlot } from './agenda.types';

@Injectable()
export class AgendaConflictService {
  constructor(
    @InjectRepository(Conferencia)
    private readonly conferencias: Repository<Conferencia>,
    @InjectRepository(Taller)
    private readonly talleres: Repository<Taller>,
  ) {}

  async validate(slot: AgendaSlot): Promise<void> {
    const [conferenceConflict, workshopConflict] = await Promise.all([
      this.hasConflict(
        this.conferencias.createQueryBuilder('actividad'),
        slot,
        slot.excludeConferenciaId,
      ),
      this.hasConflict(
        this.talleres.createQueryBuilder('actividad'),
        slot,
        slot.excludeTallerId,
      ),
    ]);

    if (conferenceConflict || workshopConflict) {
      throw new ConflictException(
        'La ubicación ya tiene una actividad en ese horario',
      );
    }
  }

  private async hasConflict<T extends Conferencia | Taller>(
    query: SelectQueryBuilder<T>,
    slot: AgendaSlot,
    excludedId?: string,
  ): Promise<boolean> {
    query
      .innerJoin('actividad.ubicacion', 'ubicacion')
      .where('ubicacion.id = :ubicacionId', {
        ubicacionId: slot.ubicacionId,
      })
      .andWhere('actividad.fecha = :fecha', { fecha: slot.fecha })
      .andWhere('actividad.hora_inicio < :horaFin', {
        horaFin: slot.horaFin,
      })
      .andWhere('actividad.hora_fin > :horaInicio', {
        horaInicio: slot.horaInicio,
      });
    if (excludedId) {
      query.andWhere('actividad.id != :excludedId', { excludedId });
    }
    return (await query.getCount()) > 0;
  }
}
