import { Module } from '@nestjs/common';
import { PonenteService } from './services/ponente.service';
import { PonenteController } from './ponente.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ponente } from './entities/ponente.entity';
import { PonentePhotoService } from './services/ponente-photo.service';
import { ArchivoMultimedia } from '../archivo_multimedia/entities/archivo_multimedia.entity';

@Module({
  controllers: [PonenteController],
  providers: [PonenteService, PonentePhotoService],
  imports: [TypeOrmModule.forFeature([Ponente, ArchivoMultimedia])],
})
export class PonenteModule {}
