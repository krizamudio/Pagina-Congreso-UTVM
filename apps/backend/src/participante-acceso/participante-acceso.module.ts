import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Ems } from '../ems/entities/ems.entity';
import { Externo } from '../externos/entities/externo.entity';
import { ParticipanteNsu } from '../registro-nsu/entities/participante-nsu.entity';
import { Utvm } from '../utvm/entities/utvm.entity';
import { EmsParticipanteAdapter } from './adapters/ems-participante.adapter';
import { ExternoParticipanteAdapter } from './adapters/externo-participante.adapter';
import { NsuParticipanteAdapter } from './adapters/nsu-participante.adapter';
import { UtvmParticipanteAdapter } from './adapters/utvm-participante.adapter';
import { ParticipanteResolverService } from './participante-resolver.service';
import { ParticipanteAccesoService } from './participante-acceso.service';

@Module({
  imports: [TypeOrmModule.forFeature([Utvm, Ems, Externo, ParticipanteNsu])],
  providers: [
    ParticipanteResolverService,
    ParticipanteAccesoService,
    UtvmParticipanteAdapter,
    EmsParticipanteAdapter,
    ExternoParticipanteAdapter,
    NsuParticipanteAdapter,
  ],
  exports: [ParticipanteResolverService, ParticipanteAccesoService],
})
export class ParticipanteAccesoModule {}
