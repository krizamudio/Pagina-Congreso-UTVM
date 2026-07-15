import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Congreso } from '../congreso/entities/congreso.entity';
import { CorreoModule } from '../correo/correo.module';
import { QrAccesoModule } from '../qr-acceso/qr-acceso.module';
import { ParticipanteQrEnvioService } from './participante-qr-envio.service';
import { DiaEventoModule } from '../dia-evento/dia-evento.module';
import { ParticipanteQrAsignacionService } from './participante-qr-asignacion.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Congreso]),
    QrAccesoModule,
    CorreoModule,
    DiaEventoModule,
  ],
  providers: [ParticipanteQrAsignacionService, ParticipanteQrEnvioService],
  exports: [ParticipanteQrEnvioService],
})
export class ParticipanteQrModule {}
