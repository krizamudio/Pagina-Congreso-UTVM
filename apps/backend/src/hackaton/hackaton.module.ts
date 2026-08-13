import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Congreso } from '../congreso/entities/congreso.entity';
import { ParticipanteAcceso } from '../participante-acceso/entities/participante-acceso.entity';
import { ParticipanteAccesoModule } from '../participante-acceso/participante-acceso.module';
import { Reconocimiento } from '../reconocimiento/entities/reconocimiento.entity';
import { ReconocimientoModule } from '../reconocimiento/reconocimiento.module';
import { HackatonEquipo } from './entities/hackaton-equipo.entity';
import { HackatonEvaluador } from './entities/hackaton-evaluador.entity';
import { HackatonIntegrante } from './entities/hackaton-integrante.entity';
import { Hackaton } from './entities/hackaton.entity';
import { HackatonController } from './hackaton.controller';
import { HackatonElegiblesService } from './services/hackaton-elegibles.service';
import { HackatonEquiposService } from './services/hackaton-equipos.service';
import { HackatonEvaluadoresService } from './services/hackaton-evaluadores.service';
import { HackatonPresenterService } from './services/hackaton-presenter.service';
import { HackatonReconocimientosService } from './services/hackaton-reconocimientos.service';
import { HackatonService } from './services/hackaton.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Hackaton,
      HackatonEvaluador,
      HackatonEquipo,
      HackatonIntegrante,
      Congreso,
      ParticipanteAcceso,
      Reconocimiento,
    ]),
    ParticipanteAccesoModule,
    ReconocimientoModule,
  ],
  controllers: [HackatonController],
  providers: [
    HackatonService,
    HackatonPresenterService,
    HackatonEvaluadoresService,
    HackatonEquiposService,
    HackatonElegiblesService,
    HackatonReconocimientosService,
  ],
})
export class HackatonModule {}
