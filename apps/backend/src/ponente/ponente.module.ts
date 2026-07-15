import { Module } from '@nestjs/common';
import { PonenteService } from './services/ponente.service';
import { PonenteController } from './ponente.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ponente } from './entities/ponente.entity';
import { PonentePhotoService } from './services/ponente-photo.service';
import { ArchivoMultimediaModule } from '../archivo_multimedia/archivo_multimedia.module';
import { CommonModule } from '../common/common.module';

@Module({
  controllers: [PonenteController],
  providers: [PonenteService, PonentePhotoService],
  imports: [
    TypeOrmModule.forFeature([Ponente]),
    ArchivoMultimediaModule,
    CommonModule,
  ],
})
export class PonenteModule {}
