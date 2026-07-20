import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Congreso } from '../../congreso/entities/congreso.entity';
import { Ponente } from '../../ponente/entities/ponente.entity';
import { Ubicacion } from '../../ubicacion/entities/ubicacion.entity';
import { AgendaRelationIds, AgendaRelations } from './agenda.types';

@Injectable()
export class AgendaRelationsService {
  constructor(
    @InjectRepository(Congreso)
    private readonly congresos: Repository<Congreso>,
    @InjectRepository(Ubicacion)
    private readonly ubicaciones: Repository<Ubicacion>,
    @InjectRepository(Ponente)
    private readonly ponentes: Repository<Ponente>,
  ) {}

  async resolve(ids: AgendaRelationIds): Promise<AgendaRelations> {
    const [congreso, ubicacion, ponente] = await Promise.all([
      this.congresos.findOneBy({ id: ids.congresoId }),
      this.ubicaciones.findOneBy({ id: ids.ubicacionId }),
      this.ponentes.findOneBy({ id: ids.ponenteId }),
    ]);
    if (!congreso) throw new NotFoundException('El congreso no existe');
    if (!ubicacion) throw new NotFoundException('La ubicación no existe');
    if (!ponente)
      throw new NotFoundException('El ponente o panelista no existe');
    return { congreso, ubicacion, ponente };
  }

  validateDateInsideCongress(fecha: string, congreso: Congreso): void {
    const eventDate = this.dateOnly(fecha);
    const start = this.dateOnly(congreso.fecha_inicio);
    const end = this.dateOnly(congreso.fecha_fin);
    if (eventDate < start || eventDate > end) {
      throw new BadRequestException(
        'La fecha de la actividad debe estar dentro de las fechas del congreso',
      );
    }
  }

  private dateOnly(value: string | Date): string {
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    return value.slice(0, 10);
  }
}
