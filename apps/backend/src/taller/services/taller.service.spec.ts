/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { BadRequestException, ConflictException } from '@nestjs/common';

import { TallerService } from './taller.service';

describe('TallerService capacity integration', () => {
  const relations = {
    congreso: {
      id: 'congreso-id',
      fecha_inicio: new Date('2099-01-01'),
      fecha_fin: new Date('2099-01-02'),
    },
    ubicacion: { id: 'ubicacion-id', capacidad: 50 },
    ponente: { id: 'ponente-id' },
  };
  const dto = {
    congreso_id: 'congreso-id',
    ubicacion_id: 'ubicacion-id',
    tallerista_id: 'ponente-id',
    titulo: 'Taller',
    descripcion: 'Descripción',
    cupo_maximo: 50,
    fecha: '2099-01-01',
    hora_inicio: '09:00',
    hora_fin: '10:00',
    requisitos: 'Ninguno',
  };

  function setup() {
    const current = {
      id: 'taller-id',
      ...dto,
      fecha: dto.fecha,
      congreso: relations.congreso,
      ubicacion: { id: 'ubicacion-anterior', capacidad: 100 },
      ponente: relations.ponente,
    };
    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      setLock: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(current),
    };
    const transactionalRepository = {
      create: jest.fn((value) => value),
      merge: jest.fn((target, value) => Object.assign(target, value)),
      save: jest.fn((value) => Promise.resolve(value)),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };
    const repository = {
      findOne: jest.fn().mockResolvedValue(current),
    };
    const manager = {
      getRepository: jest.fn().mockReturnValue(transactionalRepository),
    };
    const dataSource = {
      transaction: jest.fn((callback) => callback(manager)),
    };
    const capacity = {
      lockLocation: jest.fn().mockResolvedValue(relations.ubicacion),
      validateAgainstLocation: jest.fn((cupo, ubicacion) => {
        if (cupo > ubicacion.capacidad) throw new BadRequestException();
      }),
      validateAgainstEnrollments: jest.fn().mockResolvedValue(undefined),
    };
    const agendaRelations = {
      resolve: jest.fn().mockResolvedValue(relations),
      validateDateInsideCongress: jest.fn(),
    };
    const service = new TallerService(
      repository as never,
      { FechaValida: jest.fn(), ValidarHoras: jest.fn() } as never,
      agendaRelations as never,
      { validate: jest.fn() } as never,
      { withLock: jest.fn((_key, operation) => operation()) } as never,
      {
        handle: jest.fn((error) => {
          throw error;
        }),
      } as never,
      dataSource as never,
      capacity as never,
    );

    return {
      capacity,
      current,
      repository,
      service,
      transactionalRepository,
    };
  }

  it('rechaza crear un taller cuyo cupo excede la ubicación', async () => {
    const { service, transactionalRepository } = setup();

    await expect(
      service.createTaller({ ...dto, cupo_maximo: 51 }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(transactionalRepository.save).not.toHaveBeenCalled();
  });

  it('valida el cupo actual cuando solo cambia la ubicación', async () => {
    const { capacity, service, transactionalRepository } = setup();

    await expect(
      service.updateTaller('taller-id', { ubicacion_id: 'ubicacion-id' }),
    ).resolves.toBeDefined();
    expect(capacity.validateAgainstLocation).toHaveBeenCalledWith(
      dto.cupo_maximo,
      relations.ubicacion,
    );
    expect(transactionalRepository.save).toHaveBeenCalled();
  });

  it('no guarda si el nuevo cupo es menor a los inscritos', async () => {
    const { capacity, service, transactionalRepository } = setup();
    capacity.validateAgainstEnrollments.mockRejectedValue(
      new ConflictException(),
    );

    await expect(
      service.updateTaller('taller-id', { cupo_maximo: 40 }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(transactionalRepository.save).not.toHaveBeenCalled();
  });
});
