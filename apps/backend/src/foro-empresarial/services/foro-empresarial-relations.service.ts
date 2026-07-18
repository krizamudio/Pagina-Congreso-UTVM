import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Congreso } from '../../congreso/entities/congreso.entity';
import { Ubicacion } from '../../ubicacion/entities/ubicacion.entity';

@Injectable()
export class ForoEmpresarialRelationsService {
  constructor(
    @InjectRepository(Congreso)
    private readonly congresos: Repository<Congreso>,
    @InjectRepository(Ubicacion)
    private readonly ubicaciones: Repository<Ubicacion>,
  ) {}

  async resolveRequired(
    congresoId: string,
    ubicacionId: string,
  ): Promise<{ congreso: Congreso; ubicacion: Ubicacion }> {
    const [congreso, ubicacion] = await Promise.all([
      this.findCongreso(congresoId),
      this.findUbicacion(ubicacionId),
    ]);
    return { congreso, ubicacion };
  }

  async resolveOptional(ids: {
    congresoId?: string;
    ubicacionId?: string;
  }): Promise<{ congreso?: Congreso; ubicacion?: Ubicacion }> {
    const [congreso, ubicacion] = await Promise.all([
      ids.congresoId === undefined
        ? undefined
        : this.findCongreso(ids.congresoId),
      ids.ubicacionId === undefined
        ? undefined
        : this.findUbicacion(ids.ubicacionId),
    ]);
    return { congreso, ubicacion };
  }

  private async findCongreso(id: string): Promise<Congreso> {
    const congreso = await this.congresos.findOneBy({ id });
    if (!congreso) {
      throw new NotFoundException('El congreso indicado no existe');
    }
    return congreso;
  }

  private async findUbicacion(id: string): Promise<Ubicacion> {
    const ubicacion = await this.ubicaciones.findOneBy({ id });
    if (!ubicacion) {
      throw new NotFoundException('La ubicación indicada no existe');
    }
    return ubicacion;
  }
}
