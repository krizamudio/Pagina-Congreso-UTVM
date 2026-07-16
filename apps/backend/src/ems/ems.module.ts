import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Ems } from './entities/ems.entity';
import { EmsController } from './ems.controller';
import { EmsService } from './ems.service';
import { CommonModule } from '../common/common.module';
import { ParticipanteQrModule } from '../participante-qr/participante-qr.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ems]),
    CommonModule,
    ParticipanteQrModule,
  ],
  controllers: [EmsController],
  providers: [EmsService],
})
export class EmsModule {}
