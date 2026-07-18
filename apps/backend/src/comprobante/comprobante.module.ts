import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArchivoMultimediaModule } from '../archivo_multimedia/archivo_multimedia.module';
import { ComprobanteController } from './comprobante.controller';
import { ComprobanteService } from './comprobante.service';
import { ComprobanteStorageService } from './comprobante-storage.service';
import { ArchivoComprobante } from './entities/archivo-comprobante.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ArchivoComprobante]),
    ArchivoMultimediaModule,
  ],
  controllers: [ComprobanteController],
  providers: [ComprobanteService, ComprobanteStorageService],
  exports: [ComprobanteService, ArchivoMultimediaModule],
})
export class ComprobanteModule {}
