import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ExternosController } from './externos.controller';
import { ExternosService } from './externos.service';
import { Externo } from './entities/externo.entity';
import { ArchivoComprobante } from '../registro-nsu/entities/archivo-comprobante.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Externo,
      ArchivoComprobante,
    ]),
  ],
  controllers: [
    ExternosController,
  ],
  providers: [
    ExternosService,
  ],
  exports: [
    ExternosService,
  ],
})
export class ExternosModule {}