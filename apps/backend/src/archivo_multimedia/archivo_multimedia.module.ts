import { Module } from '@nestjs/common';
import { ArchivoMultimediaService } from './archivo_multimedia.service';
import { ArchivoMultimediaController } from './archivo_multimedia.controller';
import { CommonModule } from '../../common/common.module';

@Module({
  controllers: [ArchivoMultimediaController],
  providers: [ArchivoMultimediaService],
  imports: [CommonModule]
})
export class ArchivoMultimediaModule {}
