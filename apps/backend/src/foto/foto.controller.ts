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
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateFotoDto } from './dto/update-foto.dto';
import { FotoService } from './foto.service';
import type { IFotoUploadFile } from './interfaces/Ifoto-upload-file.interface';
import { join } from 'path';
import { diskStorage } from 'multer';

//TODO: Esto va dentro de carpeta common
function generacionDeNombresAleatorios(): string {
  const letras = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let aleatorio = '';

  for (let i = 0; i < 20; i++) {
    aleatorio += letras.charAt(Math.floor(Math.random() * letras.length));
  
  }

  const timestamp = Date.now();
      return `${timestamp}_${aleatorio}`;
}

@Controller('foto')
export class FotoController {
  constructor(private readonly fotoService: FotoService) {}


//TODO: Hacer desde el frontend que la imagen se transforme a .wep para que el servidor no trabaje tanto
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, join(process.cwd(), 'uploads'));
        },
        filename: (req, file, cb) => {
          cb(null, (file.fieldname = `${generacionDeNombresAleatorios()}`));
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
      },
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
        callback(null, allowedMimeTypes.includes(file.mimetype));
      },
    }),
  )
  async uploadFoto(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({
            fileType: /image\/(jpeg|png|gif|webp)$/,
            skipMagicNumbersValidation: true,
          }),
        ],
      }),
    )
    file: IFotoUploadFile,
  ) {
    return {
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    };
  }

  @Get()
  findAll() {
    return this.fotoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fotoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFotoDto: UpdateFotoDto) {
    return this.fotoService.update(+id, updateFotoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fotoService.remove(+id);
  }
}
