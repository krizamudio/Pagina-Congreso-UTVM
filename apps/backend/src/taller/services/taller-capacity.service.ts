import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { Ubicacion } from '../../ubicacion/entities/ubicacion.entity';
import { InscripcionTaller } from '../entities/inscripcion-taller.entity';
import { Taller } from '../entities/taller.entity';

@Injectable()
export class TallerCapacityService {
  async lockLocation(
    manager: EntityManager,
    ubicacionId: string,
  ): Promise<Ubicacion> {
    const ubicacion = await manager
      .getRepository(Ubicacion)
      .createQueryBuilder('ubicacion')
      .where('ubicacion.id = :ubicacionId', { ubicacionId })
      .setLock('pessimistic_write')
      .getOne();

    if (!ubicacion) throw new NotFoundException('La ubicación no existe');
    return ubicacion;
  }

  validateAgainstLocation(cupo: number, ubicacion: Ubicacion): void {
    if (cupo > ubicacion.capacidad) {
      throw new BadRequestException(
        'El cupo máximo del taller no puede exceder la capacidad de la ubicación',
      );
    }
  }

  async validateAgainstEnrollments(
    manager: EntityManager,
    tallerId: string,
    cupo: number,
  ): Promise<void> {
    const inscritos = await manager.getRepository(InscripcionTaller).count({
      where: { taller: { id: tallerId } },
    });

    if (cupo < inscritos) {
      throw new ConflictException(
        'El cupo máximo no puede ser menor al número de participantes inscritos',
      );
    }
  }

  async validateLocationReduction(
    manager: EntityManager,
    ubicacionId: string,
    capacidad: number,
  ): Promise<void> {
    const raw: { maximo: string | null } | undefined = await manager
      .getRepository(Taller)
      .createQueryBuilder('taller')
      .select('MAX(taller.cupo_maximo)', 'maximo')
      .where('taller.ubicacion_id = :ubicacionId', { ubicacionId })
      .andWhere('taller.deleted_at IS NULL')
      .getRawOne();
    const cupoMayor = Number(raw?.maximo ?? 0);

    if (capacidad < cupoMayor) {
      throw new ConflictException(
        'No se puede reducir la capacidad porque existen talleres con un cupo mayor',
      );
    }
  }
}
