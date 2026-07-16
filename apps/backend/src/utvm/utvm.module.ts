import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Utvm } from './entities/utvm.entity';
import { UtvmService } from './utvm.service';
import { UtvmController } from './utvm.controller';
import { CommonModule } from '../common/common.module';
import { ParticipanteQrModule } from '../participante-qr/participante-qr.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Utvm]),
    CommonModule,
    ParticipanteQrModule,
  ],
  controllers: [UtvmController],
  providers: [UtvmService],
})
export class UtvmModule {}
