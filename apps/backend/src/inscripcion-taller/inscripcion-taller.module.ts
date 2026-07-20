import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InscripcionTaller } from './entities/inscripcion-taller.entity';
import { Taller } from '../taller/entities/taller.entity';
import { Externo } from '../externos/entities/externo.entity';
import { ParticipanteNsu } from '../registro-nsu/entities/participante-nsu.entity';

import { InscripcionTallerController } from './inscripcion-taller.controller';
import { InscripcionTallerService } from './inscripcion-taller.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InscripcionTaller,
      Taller,
      Externo,
      ParticipanteNsu,
    ]),
  ],
  controllers: [InscripcionTallerController],
  providers: [InscripcionTallerService],
  exports: [InscripcionTallerService],
})
export class InscripcionTallerModule {}
