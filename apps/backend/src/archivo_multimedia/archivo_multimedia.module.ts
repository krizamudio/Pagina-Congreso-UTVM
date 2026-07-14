import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArchivoMultimedia } from './entities/archivo_multimedia.entity';
import { ArchivoMultimediaController, FotoController } from './controllers';
import { ArchivoMultimediaMapper } from './mappers';
import {
  ArchivoConcurrencyInterceptor,
  ArchivoMultimediaService,
  ArchivoRetryService,
  ArchivoStorageService,
  SupabaseStorageService,
} from './services';
import { CommonModule } from '../common/common.module';

@Module({
  controllers: [ArchivoMultimediaController, FotoController],
  providers: [
    ArchivoMultimediaService,
    ArchivoStorageService,
    ArchivoConcurrencyInterceptor,
    ArchivoRetryService,
    SupabaseStorageService,
    ArchivoMultimediaMapper,
  ],
  imports: [TypeOrmModule.forFeature([ArchivoMultimedia]), CommonModule],
  exports: [ArchivoMultimediaService, ArchivoStorageService],
})
export class ArchivoMultimediaModule {}
