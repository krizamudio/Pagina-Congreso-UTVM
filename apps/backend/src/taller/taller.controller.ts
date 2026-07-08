import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TallerService } from './taller.service';
import { CreateTallerDto } from './dto/create-taller.dto';
import { UpdateTallerDto } from './dto/update-taller.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('taller')
export class TallerController {
  constructor(private readonly tallerService: TallerService) {}

  @Post()
  create(@Body() createTallerDto: CreateTallerDto) {
    return this.tallerService.createTaller(createTallerDto);
  }

  @Get()
  findAll() {
    return this.tallerService.findAllTalleres();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tallerService.findOneTaller(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTallerDto: UpdateTallerDto) {
    return this.tallerService.updateTaller(id, updateTallerDto);
  }

  @Post(':id/imagen')
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: diskStorage({
        destination: './uploads/talleres',
        filename: (_req, file, callback) => {
          const uniqueName = `${Date.now()}-${Math.round(
            Math.random() * 1e9,
          )}${extname(file.originalname)}`;

          callback(null, uniqueName);
        },
      }),
      fileFilter: (_req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return callback(
            new Error('Solo se permiten imágenes JPG, JPEG, PNG o WEBP'),
            false,
          );
        }

        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  uploadImagen(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.tallerService.uploadImagenTaller(id, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tallerService.removeTaller(id);
  }
}
