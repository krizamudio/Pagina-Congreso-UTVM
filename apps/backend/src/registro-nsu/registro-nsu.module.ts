import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RegistroNsuController } from './registro-nsu.controller';
import { RegistroNsuService } from './registro-nsu.service';
import { RegistroNsu } from './entities/registro-nsu.entity';
import { ParticipanteNsu } from './entities/participante-nsu.entity';
import { CommonModule } from '../common/common.module';
import { ParticipanteQrModule } from '../participante-qr/participante-qr.module';
import { ComprobanteModule } from '../comprobante/comprobante.module';

@Module({
  imports: [CommonModule, ParticipanteQrModule, ComprobanteModule],
  controllers: [RegistroNsuController],
  providers: [
    RegistroNsuService,
    {
      provide: 'REGISTRO_NSU_REPOSITORY',
      inject: [DataSource],
      useFactory: (dataSource: DataSource) =>
        dataSource.getRepository(RegistroNsu),
    },
    {
      provide: 'PARTICIPANTE_NSU_REPOSITORY',
      inject: [DataSource],
      useFactory: (dataSource: DataSource) =>
        dataSource.getRepository(ParticipanteNsu),
    },
  ],
})
export class RegistroNsuModule {}
