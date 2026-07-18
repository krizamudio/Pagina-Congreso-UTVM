/// <reference types="jest" />

import { ConflictException } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { Conferencia } from '../../conferencia/entities/conferencia.entity';
import { Taller } from '../../taller/entities/taller.entity';
import { AgendaConflictService } from './agenda-conflict.service';

function queryBuilder<T>(count: number): SelectQueryBuilder<T> {
  const query = {
    innerJoin: jest.fn(),
    where: jest.fn(),
    andWhere: jest.fn(),
    getCount: jest.fn().mockResolvedValue(count),
  };
  query.innerJoin.mockReturnValue(query);
  query.where.mockReturnValue(query);
  query.andWhere.mockReturnValue(query);
  return query as unknown as SelectQueryBuilder<T>;
}

describe('AgendaConflictService', () => {
  const slot = {
    fecha: '2026-09-01',
    horaInicio: '10:00',
    horaFin: '11:00',
    ubicacionId: '662d9003-55f0-4d00-a9b3-d5baccae4a51',
  };

  it('acepta un horario disponible', async () => {
    const conferences = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder(0)),
    } as unknown as Repository<Conferencia>;
    const workshops = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder(0)),
    } as unknown as Repository<Taller>;

    await expect(
      new AgendaConflictService(conferences, workshops).validate(slot),
    ).resolves.toBeUndefined();
  });

  it('rechaza un traslape contra cualquier tipo de actividad', async () => {
    const conferences = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder(0)),
    } as unknown as Repository<Conferencia>;
    const workshops = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder(1)),
    } as unknown as Repository<Taller>;

    await expect(
      new AgendaConflictService(conferences, workshops).validate(slot),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
