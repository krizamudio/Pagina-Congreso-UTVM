import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ExternosController } from './externos.controller';
import { ExternosService } from './externos.service';
import { Externo } from './entities/externo.entity';
import { CommonModule } from '../common/common.module';
import { ParticipanteQrModule } from '../participante-qr/participante-qr.module';
import { ComprobanteModule } from '../comprobante/comprobante.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Externo]),
    CommonModule,
    ParticipanteQrModule,
    ComprobanteModule,
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
