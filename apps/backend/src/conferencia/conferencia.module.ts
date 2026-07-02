import { Module } from '@nestjs/common';
import { ConferenciasService } from './conferencia.service';
import { ConferenciasController } from './conferencia.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conferencia } from './entities/conferencia.entity';
import { CommonModule } from '../../common/common.module';

@Module({
  controllers: [ConferenciasController],
  providers: [ConferenciasService],
  imports: [TypeOrmModule.forFeature([Conferencia]), CommonModule],
})
export class ConferenciasModule {}
