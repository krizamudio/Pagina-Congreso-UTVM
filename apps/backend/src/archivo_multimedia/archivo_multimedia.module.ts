import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArchivoMultimedia } from './entities/archivo_multimedia.entity';
import { ArchivoMultimediaController, FotoController } from './controllers';
import {
  ArchivoConcurrencyInterceptor,
  ArchivoLockService,
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
    ArchivoLockService,
    ArchivoRetryService,
    SupabaseStorageService,
  ],
  imports: [TypeOrmModule.forFeature([ArchivoMultimedia]), CommonModule],
})
export class ArchivoMultimediaModule {}
