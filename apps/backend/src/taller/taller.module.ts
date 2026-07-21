import { Module } from '@nestjs/common';
import { TallerService } from './services/taller.service';
import { TallerController } from './taller.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Taller } from './entities/taller.entity';
import { CommonModule } from '../common/common.module';
import { AgendaModule } from '../gestion-contenido/agenda/agenda.module';
import { InscripcionTaller } from './entities/inscripcion-taller.entity';
import { ParticipanteAccesoModule } from '../participante-acceso/participante-acceso.module';
import { InscripcionTallerController } from './inscripcion-taller.controller';
import { InscripcionTallerService } from './services/inscripcion-taller.service';
import { TallerCapacityService } from './services/taller-capacity.service';

@Module({
  controllers: [TallerController, InscripcionTallerController],
  providers: [TallerService, InscripcionTallerService, TallerCapacityService],
  imports: [
    TypeOrmModule.forFeature([Taller, InscripcionTaller]),
    CommonModule,
    AgendaModule,
    ParticipanteAccesoModule,
  ],
  exports: [TypeOrmModule, InscripcionTallerService, TallerCapacityService],
})
export class TallerModule {}
