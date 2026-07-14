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
@Controller('archivos')
export class ArchivoMultimediaController {
  constructor(private readonly storageService: ArchivoStorageService) {}

  @Post()
  @UseInterceptors(
    ArchivoConcurrencyInterceptor,
    FileInterceptor('archivo', ARCHIVO_UPLOAD_OPTIONS),
  )
  create(
    @UploadedFile(crearPipeArchivo('documentos'))
    archivo: Express.Multer.File,
  ): Promise<string> {
    return this.storageService.uploadFile(archivo, 'documentos');
  }

  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ArchivoResponseDto> {
    return this.storageService.getFile(id, 'documentos');
  }

  @Patch(':id')
  @UseInterceptors(
    ArchivoConcurrencyInterceptor,
    FileInterceptor('archivo', ARCHIVO_UPLOAD_OPTIONS),
  )
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UploadedFile(crearPipeArchivo('documentos'))
    archivo: Express.Multer.File,
  ): Promise<ArchivoResponseDto> {
    return this.storageService.updateFile(id, archivo, 'documentos');
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<string> {
    return this.storageService.deleteFile(id, 'documentos');
  }
}
