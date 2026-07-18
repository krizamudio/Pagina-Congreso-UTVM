import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Congreso } from '../../congreso/entities/congreso.entity';
import { Repository } from 'typeorm';
import { Ubicacion } from '../../ubicacion/entities/ubicacion.entity';
import { Ponente } from '../../ponente/entities/ponente.entity';

interface TallerRelationIds {
  congreso_id?: string;
  ubicacion_id?: string;
  tallerista_id?: string;
}

interface TallerRelations {
  congreso?: Pick<Congreso, 'id'>;
  ubicacion?: Pick<Ubicacion, 'id'>;
  ponente?: Pick<Ponente, 'id'>;
}

@Injectable()
export class TallerRelationsService {
  constructor(
    @InjectRepository(Congreso)
    private readonly congresos: Repository<Congreso>,
    @InjectRepository(Ubicacion)
    private readonly ubicaciones: Repository<Ubicacion>,
    @InjectRepository(Ponente)
    private readonly ponentes: Repository<Ponente>,
  ) {}

  async resolve(ids: TallerRelationIds): Promise<TallerRelations> {
    const relations: TallerRelations = {};

    if (ids.congreso_id) {
      if (!(await this.congresos.existsBy({ id: ids.congreso_id }))) {
        throw new NotFoundException(
          `Congreso con id ${ids.congreso_id} no encontrado`,
        );
      }
      relations.congreso = { id: ids.congreso_id };
    }

    if (ids.ubicacion_id) {
      if (!(await this.ubicaciones.existsBy({ id: ids.ubicacion_id }))) {
        throw new NotFoundException(
          `Ubicación con id ${ids.ubicacion_id} no encontrada`,
        );
      }
      relations.ubicacion = { id: ids.ubicacion_id };
    }

    if (ids.tallerista_id) {
      if (!(await this.ponentes.existsBy({ id: ids.tallerista_id }))) {
        throw new NotFoundException(
          `Tallerista con id ${ids.tallerista_id} no encontrado`,
        );
      }
      relations.ponente = { id: ids.tallerista_id };
    }

    return relations;
  }
}
