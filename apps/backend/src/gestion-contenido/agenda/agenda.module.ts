import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Conferencia } from '../../conferencia/entities/conferencia.entity';
import { Congreso } from '../../congreso/entities/congreso.entity';
import { Ponente } from '../../ponente/entities/ponente.entity';
import { Taller } from '../../taller/entities/taller.entity';
import { Ubicacion } from '../../ubicacion/entities/ubicacion.entity';
import { AgendaConflictService } from './agenda-conflict.service';
import { AgendaRelationsService } from './agenda-relations.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Conferencia,
      Taller,
      Congreso,
      Ubicacion,
      Ponente,
    ]),
  ],
  providers: [AgendaConflictService, AgendaRelationsService],
  exports: [AgendaConflictService, AgendaRelationsService],
})
export class AgendaModule {}
