import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CodigoQrModule } from '../codigo-qr/codigo-qr.module';
import { CommonModule } from '../common/common.module';
import { DiaEventoModule } from '../dia-evento/dia-evento.module';
import { ParticipanteAcceso } from '../participante-acceso/entities/participante-acceso.entity';
import { ParticipanteAccesoModule } from '../participante-acceso/participante-acceso.module';
import { QrGeneratorModule } from '../qr-generator/qr-generator.module';
import { DiaParticipante } from './entities/dia-participante.entity';
import { QrAcceso } from './entities/qr-acceso.entity';
import { QrAccesoController } from './qr-acceso.controller';
import { QrAccessErrorService } from './services/qr-access-error.service';
import { QrAccesoIssuanceService } from './services/qr-acceso-issuance.service';
import { QrAccesoValidationService } from './services/qr-acceso-validation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([QrAcceso, DiaParticipante, ParticipanteAcceso]),
    CodigoQrModule,
    QrGeneratorModule,
    DiaEventoModule,
    ParticipanteAccesoModule,
    CommonModule,
  ],
  controllers: [QrAccesoController],
  providers: [
    QrAccessErrorService,
    QrAccesoIssuanceService,
    QrAccesoValidationService,
  ],
  exports: [QrAccesoIssuanceService],
})
export class QrAccesoModule {}
