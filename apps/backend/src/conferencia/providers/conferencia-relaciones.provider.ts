import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Congreso } from '../../congreso/entities/congreso.entity';
import { Ponente } from '../../ponente/entities/ponente.entity';
import { PonenteTipo } from '../../ponente/enums/ponente-tipo.enum';
import { Ubicacion } from '../../ubicacion/entities/ubicacion.entity';
import {
  ConferenciaRelacionIds,
  ConferenciaRelaciones,
} from '../interfaces/conferencia-relaciones.interface';

@Injectable()
export class ConferenciaRelacionesProvider {
  constructor(
    @InjectRepository(Congreso)
    private readonly congresoRepository: Repository<Congreso>,
    @InjectRepository(Ubicacion)
    private readonly ubicacionRepository: Repository<Ubicacion>,
    @InjectRepository(Ponente)
    private readonly ponenteRepository: Repository<Ponente>,
  ) {}

  async obtenerRelaciones(
    ids: ConferenciaRelacionIds,
  ): Promise<ConferenciaRelaciones> {
    const relaciones: ConferenciaRelaciones = {};

    if (ids.congreso_id) {
      const existeCongreso = await this.congresoRepository.existsBy({
        id: ids.congreso_id,
      });

      if (!existeCongreso) {
        throw new NotFoundException(
          `Congreso con id ${ids.congreso_id} no encontrado`,
        );
      }

      relaciones.congreso = { id: ids.congreso_id };
    }

    if (ids.ubicacion_id) {
      const existeUbicacion = await this.ubicacionRepository.existsBy({
        id: ids.ubicacion_id,
      });

      if (!existeUbicacion) {
        throw new NotFoundException(
          `Ubicación con id ${ids.ubicacion_id} no encontrada`,
        );
      }

      relaciones.ubicacion = { id: ids.ubicacion_id };
    }

    if (ids.ponente_id) {
      const existePonente = await this.ponenteRepository.existsBy({
        id: ids.ponente_id,
        tipo: PonenteTipo.PONENTE,
      });

      if (!existePonente) {
        throw new NotFoundException(
          `Ponente con id ${ids.ponente_id} no encontrado o el registro es un panelista`,
        );
      }

      relaciones.ponente = { id: ids.ponente_id };
    }

    return relaciones;
  }
}
