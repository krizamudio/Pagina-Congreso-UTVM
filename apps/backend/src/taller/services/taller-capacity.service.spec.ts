import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import type { EntityManager } from 'typeorm';

import { Ubicacion } from '../../ubicacion/entities/ubicacion.entity';
import { InscripcionTaller } from '../entities/inscripcion-taller.entity';
import { Taller } from '../entities/taller.entity';
import { TallerCapacityService } from './taller-capacity.service';

describe('TallerCapacityService', () => {
  const service = new TallerCapacityService();

  it('acepta un cupo igual a la capacidad de la ubicación', () => {
    expect(() =>
      service.validateAgainstLocation(100, {
        capacidad: 100,
      } as Ubicacion),
    ).not.toThrow();
  });

  it('rechaza un cupo superior a la capacidad de la ubicación', () => {
    expect(() =>
      service.validateAgainstLocation(101, {
        capacidad: 100,
      } as Ubicacion),
    ).toThrow(BadRequestException);
  });

  it('rechaza reducir el cupo por debajo de los inscritos', async () => {
    const manager = managerWith({ inscritos: 8 });

    await expect(
      service.validateAgainstEnrollments(manager, 'taller-id', 7),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rechaza reducir una ubicación por debajo del mayor cupo activo', async () => {
    const manager = managerWith({ cupoMayor: '80' });

    await expect(
      service.validateLocationReduction(manager, 'ubicacion-id', 79),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('bloquea y devuelve la ubicación solicitada', async () => {
    const ubicacion = { id: 'ubicacion-id', capacidad: 50 } as Ubicacion;
    const manager = managerWith({ ubicacion });

    await expect(service.lockLocation(manager, 'ubicacion-id')).resolves.toBe(
      ubicacion,
    );
  });

  it('responde no encontrado si la ubicación no existe', async () => {
    const manager = managerWith({ ubicacion: null });

    await expect(
      service.lockLocation(manager, 'ubicacion-id'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

function managerWith(options: {
  inscritos?: number;
  cupoMayor?: string | null;
  ubicacion?: Ubicacion | null;
}): EntityManager {
  const queryBuilder = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    setLock: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockResolvedValue(options.ubicacion),
    getRawOne: jest.fn().mockResolvedValue({
      maximo: options.cupoMayor ?? null,
    }),
  };
  const repositories = new Map<unknown, unknown>([
    [
      Ubicacion,
      {
        createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      },
    ],
    [
      InscripcionTaller,
      {
        count: jest.fn().mockResolvedValue(options.inscritos ?? 0),
      },
    ],
    [
      Taller,
      {
        createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      },
    ],
  ]);

  return {
    getRepository: jest.fn((entity) => repositories.get(entity)),
  } as unknown as EntityManager;
}
