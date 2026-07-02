import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
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
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async uploadPhoto(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({
            fileType: /^(image\/jpeg|image\/png|image\/webp)$/,
          }),
        ],
      }),
    )
    foto: Express.Multer.File,
  ) {
    return this.archivoMultimediaService.uploadPhoto(foto);
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
