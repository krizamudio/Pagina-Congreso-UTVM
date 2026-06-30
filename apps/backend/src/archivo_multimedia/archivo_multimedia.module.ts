import { Module } from '@nestjs/common';
import { ArchivoMultimediaService } from './archivo_multimedia.service';
import { ArchivoMultimediaController } from './archivo_multimedia.controller';

@Module({
  controllers: [ArchivoMultimediaController],
  providers: [ArchivoMultimediaService],
})
export class ArchivoMultimediaModule {}
