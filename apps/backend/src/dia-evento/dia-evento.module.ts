import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from '../common/common.module';
import { Congreso } from '../congreso/entities/congreso.entity';
import { DiaEventoController } from './dia-evento.controller';
import { DiaEventoService } from './dia-evento.service';
import { DiaEvento } from './entities/dia-evento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DiaEvento, Congreso]), CommonModule],
  controllers: [DiaEventoController],
  providers: [DiaEventoService],
  exports: [DiaEventoService, TypeOrmModule],
})
export class DiaEventoModule {}
