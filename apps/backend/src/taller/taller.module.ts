import { Module } from '@nestjs/common';
import { TallerService } from './services/taller.service';
import { TallerController } from './taller.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Taller } from './entities/taller.entity';
import { CommonModule } from '../common/common.module';
import { TallerRelationsService } from './services/taller-relations.service';

@Module({
  controllers: [TallerController],
  providers: [TallerService, TallerRelationsService],
  imports: [TypeOrmModule.forFeature([Taller]), CommonModule],
})
export class TallerModule {}
