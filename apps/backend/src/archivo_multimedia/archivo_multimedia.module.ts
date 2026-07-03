import { Module } from '@nestjs/common';
import { ArchivoMultimediaService } from './archivo_multimedia.service';
import { ArchivoMultimediaController } from './archivo_multimedia.controller';
import { CommonModule } from '../../common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArchivoMultimedia } from './entities/archivo_multimedia.entity';

@Module({
  controllers: [ArchivoMultimediaController],
  providers: [ArchivoMultimediaService],
  imports: [TypeOrmModule.forFeature([ArchivoMultimedia]), CommonModule],
})
export class ArchivoMultimediaModule {}
