import 'reflect-metadata';

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { POSTGRES_INTEGER_MAX } from '../../common/database/postgres-limits.constant';
import { CreateUbicacionDto } from './create-ubicacion.dto';

describe('CreateUbicacionDto', () => {
  it('acepta la capacidad máxima soportada por PostgreSQL integer', async () => {
    const dto = plainToInstance(CreateUbicacionDto, {
      nombre: 'Auditorio',
      capacidad: POSTGRES_INTEGER_MAX,
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rechaza una capacidad que desborda PostgreSQL integer', async () => {
    const dto = plainToInstance(CreateUbicacionDto, {
      nombre: 'Auditorio',
      capacidad: POSTGRES_INTEGER_MAX + 1,
    });

    const errors = await validate(dto);
    const capacidadError = errors.find(
      ({ property }) => property === 'capacidad',
    );

    expect(capacidadError).toBeDefined();
    expect(typeof capacidadError?.constraints?.max).toBe('string');
  });
});
