import { Module } from '@nestjs/common';
import { TallerService } from './services/taller.service';
import { TallerController } from './taller.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Taller } from './entities/taller.entity';
import { CommonModule } from '../common/common.module';
import { AgendaModule } from '../gestion-contenido/agenda/agenda.module';

@Module({
  controllers: [TallerController],
  providers: [TallerService],
  imports: [TypeOrmModule.forFeature([Taller]), CommonModule, AgendaModule],
})
export class TallerModule {}
