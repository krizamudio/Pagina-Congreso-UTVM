import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Conferencia } from '../conferencia/entities/conferencia.entity';
import { ParticipanteAccesoModule } from '../participante-acceso/participante-acceso.module';
import { InscripcionTaller } from '../taller/entities/inscripcion-taller.entity';
import { Taller } from '../taller/entities/taller.entity';
import { Reconocimiento } from './entities/reconocimiento.entity';
import { ReconocimientoController } from './reconocimiento.controller';
import { ReconocimientoService } from './reconocimiento.service';
import { ReconocimientoEmisionService } from './services/reconocimiento-emision.service';
import { ReconocimientoJobService } from './services/reconocimiento-job.service';
import { ReconocimientoRendererService } from './services/reconocimiento-renderer.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([
      Reconocimiento,
      Taller,
      Conferencia,
      InscripcionTaller,
    ]),
    ParticipanteAccesoModule,
  ],
  controllers: [ReconocimientoController],
  providers: [
    ReconocimientoService,
    ReconocimientoRendererService,
    ReconocimientoEmisionService,
    ReconocimientoJobService,
  ],
})
export class ReconocimientoModule {}
