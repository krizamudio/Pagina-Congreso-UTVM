import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArchivoMultimedia } from './entities/archivo_multimedia.entity';
import { ArchivoMultimediaController, FotoController } from './controllers';
import {
  ArchivoConcurrencyInterceptor,
  ArchivoMultimediaService,
  ArchivoStorageService,
} from './services';
import { CommonModule } from '../common/common.module';

@Module({
  controllers: [ArchivoMultimediaController, FotoController],
  providers: [
    ArchivoMultimediaService,
    ArchivoStorageService,
    ArchivoConcurrencyInterceptor,
  ],
  imports: [TypeOrmModule.forFeature([ArchivoMultimedia]), CommonModule],
})
export class ArchivoMultimediaModule {}
