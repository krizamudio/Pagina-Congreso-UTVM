import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { ArchivoResponseDto } from '../dto';
import {
  ARCHIVO_UPLOAD_OPTIONS,
  ArchivoConcurrencyInterceptor,
  ArchivoStorageService,
  crearPipeArchivo,
} from '../services';

// TODO: Agregar autenticacion y autorizacion a todos los endpoints.
@Controller('fotos')
export class FotoController {
  constructor(private readonly storageService: ArchivoStorageService) {}

  @Post()
  @UseInterceptors(
    ArchivoConcurrencyInterceptor,
    FileInterceptor('foto', ARCHIVO_UPLOAD_OPTIONS),
  )
  create(
    @UploadedFile(crearPipeArchivo('imagenes')) foto: Express.Multer.File,
  ): Promise<ArchivoResponseDto> {
    return this.storageService.uploadFile(foto, 'imagenes');
  }

  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ArchivoResponseDto> {
    return this.storageService.getFile(id, 'imagenes');
  }

  @Patch(':id')
  @UseInterceptors(
    ArchivoConcurrencyInterceptor,
    FileInterceptor('foto', ARCHIVO_UPLOAD_OPTIONS),
  )
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UploadedFile(crearPipeArchivo('imagenes')) foto: Express.Multer.File,
  ): Promise<ArchivoResponseDto> {
    return this.storageService.updateFile(id, foto, 'imagenes');
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<string> {
    return this.storageService.deleteFile(id, 'imagenes');
  }
}
