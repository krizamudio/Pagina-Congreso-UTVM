import { Module } from '@nestjs/common';
import { TallerService } from './services/taller.service';
import { TallerController } from './taller.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Taller } from './entities/taller.entity';
import { CommonModule } from '../common/common.module';
import { TallerRelationsService } from './services/taller-relations.service';
import { Congreso } from '../congreso/entities/congreso.entity';
import { Ubicacion } from '../ubicacion/entities/ubicacion.entity';
import { Ponente } from '../ponente/entities/ponente.entity';

@Module({
  controllers: [TallerController],
  providers: [TallerService, TallerRelationsService],
  imports: [
    TypeOrmModule.forFeature([Taller, Congreso, Ubicacion, Ponente]),
    CommonModule,
  ],
})
export class TallerModule {}
