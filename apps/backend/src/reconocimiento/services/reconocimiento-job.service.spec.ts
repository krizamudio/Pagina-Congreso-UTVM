import { SchedulerRegistry } from '@nestjs/schedule';

import { ReconocimientoJobService } from './reconocimiento-job.service';

describe('ReconocimientoJobService', () => {
  function setup(enabled = 'true') {
    const emision = {
      prepareFinishedActivities: jest.fn().mockResolvedValue(undefined),
    };
    const values: Record<string, string> = {
      RECONOCIMIENTOS_CRON: '*/5 * * * *',
      RECONOCIMIENTOS_TIMEZONE: 'America/Mexico_City',
      RECONOCIMIENTOS_JOB_ENABLED: enabled,
    };
    const config = {
      get: jest.fn((key: string, fallback: string) => values[key] ?? fallback),
    };
    const scheduler = new SchedulerRegistry();
    const service = new ReconocimientoJobService(
      emision as never,
      config as never,
      scheduler,
    );
    return { service, scheduler, emision };
  }

  it('registra y retira el cron configurable durante el ciclo del módulo', () => {
    const { service, scheduler } = setup();
    service.onModuleInit();
    expect(scheduler.doesExist('cron', 'reconocimientos-automaticos')).toBe(
      true,
    );
    service.onModuleDestroy();
    expect(scheduler.doesExist('cron', 'reconocimientos-automaticos')).toBe(
      false,
    );
  });

  it('ejecuta la preparación cuando está habilitado', async () => {
    const { service, emision } = setup();
    await service.run();
    expect(emision.prepareFinishedActivities).toHaveBeenCalledTimes(1);
  });

  it('omite la preparación cuando está deshabilitado', async () => {
    const { service, emision } = setup('false');
    await service.run();
    expect(emision.prepareFinishedActivities).not.toHaveBeenCalled();
  });
});
