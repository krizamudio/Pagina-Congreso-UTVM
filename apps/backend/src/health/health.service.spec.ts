import { DataSource } from 'typeorm';

import { HealthService } from './health.service';

describe('HealthService', () => {
  it('confirma la disponibilidad cuando PostgreSQL responde', async () => {
    const query = jest.fn().mockResolvedValue([{ '?column?': 1 }]);
    const dataSource = {
      query,
    } as unknown as DataSource;
    const service = new HealthService(dataSource);

    await expect(service.check()).resolves.toEqual({ status: 'ok' });
    expect(query).toHaveBeenCalledWith('SELECT 1');
  });

  it('propaga el error cuando PostgreSQL no está disponible', async () => {
    const databaseError = new Error('PostgreSQL no disponible');
    const dataSource = {
      query: jest.fn().mockRejectedValue(databaseError),
    } as unknown as DataSource;
    const service = new HealthService(dataSource);

    await expect(service.check()).rejects.toBe(databaseError);
  });
});
