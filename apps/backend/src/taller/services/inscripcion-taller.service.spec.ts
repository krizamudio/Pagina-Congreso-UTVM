/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/require-await, @typescript-eslint/no-unnecessary-type-assertion */
import { ConflictException, NotFoundException } from '@nestjs/common';

import { ParticipanteTipo } from '../../participante-acceso/participante-tipo.enum';
import { Taller } from '../entities/taller.entity';
import { InscripcionTallerService } from './inscripcion-taller.service';

describe('InscripcionTallerService', () => {
  const futureTaller = {
    id: 'taller-1',
    fecha: '2099-01-01',
    hora_inicio: '09:00:00',
    cupo_maximo: 2,
    congreso: { id: 'congreso-1' },
  };

  function setup(
    options: {
      taller?: typeof futureTaller | null;
      existente?: { taller: { id: string } } | null;
      inscritos?: number;
    } = {},
  ) {
    const taller = options.taller === undefined ? futureTaller : options.taller;
    const qb = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      setLock: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(taller),
    };
    const inscripcionRepository = {
      findOne: jest.fn().mockResolvedValue(options.existente ?? null),
      count: jest.fn().mockResolvedValue(options.inscritos ?? 0),
      create: jest.fn((value) => ({ id: 'inscripcion-1', ...value })),
      save: jest.fn(async (value) => value),
    };
    const tallerRepository = { createQueryBuilder: jest.fn(() => qb) };
    const manager = {
      getRepository: jest.fn((entity) =>
        entity === Taller ? tallerRepository : inscripcionRepository,
      ),
    };
    const dataSource = {
      transaction: jest.fn((callback) => callback(manager)),
    };
    const resolver = { resolve: jest.fn().mockResolvedValue({}) };
    const acceso = {
      findOrCreate: jest.fn().mockResolvedValue({ id: 'participante-1' }),
    };
    const service = new InscripcionTallerService(
      dataSource as never,
      resolver as never,
      acceso as never,
    );
    return { service, resolver, acceso, inscripcionRepository };
  }

  it.each(Object.values(ParticipanteTipo))(
    'acepta un participante válido de tipo %s',
    async (tipoParticipante) => {
      const { service, resolver } = setup();
      const result = await service.create('taller-1', {
        tipoParticipante,
        referenciaId: '123',
      });
      expect(result).toEqual(expect.objectContaining({ id: 'inscripcion-1' }));
      expect(resolver.resolve).toHaveBeenCalledWith(
        tipoParticipante,
        '123',
        expect.anything(),
      );
    },
  );

  it('rechaza un taller inexistente', async () => {
    const { service } = setup({ taller: null });
    await expect(
      service.create('taller-1', {
        tipoParticipante: ParticipanteTipo.UTVM,
        referenciaId: '1',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rechaza otro taller del mismo congreso', async () => {
    const { service } = setup({ existente: { taller: { id: 'taller-2' } } });
    await expect(
      service.create('taller-1', {
        tipoParticipante: ParticipanteTipo.EMS,
        referenciaId: '1',
      }),
    ).rejects.toThrow('otro taller del congreso');
  });

  it('rechaza sobrecupo mientras mantiene bloqueada la fila del taller', async () => {
    const { service, inscripcionRepository } = setup({ inscritos: 2 });
    await expect(
      service.create('taller-1', {
        tipoParticipante: ParticipanteTipo.NSU,
        referenciaId: 'id',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(inscripcionRepository.save).not.toHaveBeenCalled();
  });

  it('rechaza inscripciones después del inicio', async () => {
    const { service } = setup({
      taller: { ...futureTaller, fecha: '2020-01-01' },
    });
    await expect(
      service.create('taller-1', {
        tipoParticipante: ParticipanteTipo.EXTERNO,
        referenciaId: 'id',
      }),
    ).rejects.toThrow('ya inició');
  });
});
