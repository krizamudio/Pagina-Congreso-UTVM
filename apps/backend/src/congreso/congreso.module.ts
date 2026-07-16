import { Module } from '@nestjs/common';
import { CongresoService } from './congreso.service';
import { CongresoController } from './congreso.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Congreso } from './entities/congreso.entity';
import { CommonModule } from '../common/common.module';

@Module({
  controllers: [CongresoController],
  providers: [CongresoService,],
  imports: [TypeOrmModule.forFeature([Congreso]), CommonModule]
})
export class CongresoModule {}
