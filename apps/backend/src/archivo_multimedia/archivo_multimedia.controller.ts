import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ArchivoMultimediaService } from './archivo_multimedia.service';
import { CreateArchivoMultimediaDto } from './dto/create-archivo_multimedia.dto';
import { UpdateArchivoMultimediaDto } from './dto/update-archivo_multimedia.dto';
import { FileInterceptor } from '@nestjs/platform-express';



@Controller('archivo-multimedia')
export class ArchivoMultimediaController {
  constructor(
    private readonly archivoMultimediaService: ArchivoMultimediaService,
  ) {}

  @Post('upload/photo')
  @UseInterceptors(
    FileInterceptor('foto', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
      },
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
        callback(null, allowedMimeTypes.includes(file.mimetype));
      },
    }),
  )
  async uploadPhoto(@UploadedFile() foto: Express.Multer.File) {
    return this.archivoMultimediaService.uploadPhoto(foto);
  }

  @Post()
  create(@Body() createArchivoMultimediaDto: CreateArchivoMultimediaDto) {
    return this.archivoMultimediaService.create(createArchivoMultimediaDto);
  }

  @Get()
  findAll() {
    return this.archivoMultimediaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.archivoMultimediaService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateArchivoMultimediaDto: UpdateArchivoMultimediaDto,
  ) {
    return this.archivoMultimediaService.update(
      +id,
      updateArchivoMultimediaDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.archivoMultimediaService.remove(+id);
  }
}
