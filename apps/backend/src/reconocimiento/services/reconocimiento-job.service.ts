import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

import { ReconocimientoEmisionService } from './reconocimiento-emision.service';

@Injectable()
export class ReconocimientoJobService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ReconocimientoJobService.name);
  private readonly jobName = 'reconocimientos-automaticos';

  constructor(
    private readonly emision: ReconocimientoEmisionService,
    private readonly config: ConfigService,
    private readonly scheduler: SchedulerRegistry,
  ) {}

  onModuleInit(): void {
    const expression = this.config.get<string>(
      'RECONOCIMIENTOS_CRON',
      '*/5 * * * *',
    );
    const timezone = this.config.get<string>(
      'RECONOCIMIENTOS_TIMEZONE',
      'America/Mexico_City',
    );
    const job = new CronJob(
      expression,
      () => void this.run(),
      null,
      false,
      timezone,
    );
    this.scheduler.addCronJob(this.jobName, job);
    job.start();
  }

  onModuleDestroy(): void {
    if (this.scheduler.doesExist('cron', this.jobName)) {
      this.scheduler.deleteCronJob(this.jobName);
    }
  }

  async run(): Promise<void> {
    if (
      this.config.get<string>('RECONOCIMIENTOS_JOB_ENABLED', 'true') === 'false'
    )
      return;
    try {
      await this.emision.prepareFinishedActivities();
    } catch (error) {
      this.logger.error(
        'Falló la preparación automática de reconocimientos',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
