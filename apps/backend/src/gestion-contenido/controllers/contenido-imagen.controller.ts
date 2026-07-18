import {
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { ArchivoResponseDto } from '../../archivo_multimedia/dto';
import {
  ARCHIVO_UPLOAD_OPTIONS,
  ArchivoConcurrencyInterceptor,
  crearPipeArchivo,
} from '../../archivo_multimedia/services';
import { ImagenContenidoDestino } from '../enums/imagen-contenido-destino.enum';
import { ContenidoImagenService } from '../services/contenido-imagen.service';

// TODO: Restringir estos endpoints al administrador autenticado.
@Controller('gestion-contenido/imagenes')
export class ContenidoImagenController {
  constructor(private readonly service: ContenidoImagenService) {}

  @Post(':destino')
  @UseInterceptors(
    ArchivoConcurrencyInterceptor,
    FileInterceptor('imagen', ARCHIVO_UPLOAD_OPTIONS),
  )
  upload(
    @Param('destino', new ParseEnumPipe(ImagenContenidoDestino))
    destino: ImagenContenidoDestino,
    @UploadedFile(crearPipeArchivo('imagenes')) imagen: Express.Multer.File,
  ): Promise<ArchivoResponseDto> {
    return this.service.upload(imagen, destino);
  }

  @Get(':destino/:id')
  findOne(
    @Param('destino', new ParseEnumPipe(ImagenContenidoDestino))
    destino: ImagenContenidoDestino,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ArchivoResponseDto> {
    return this.service.findOne(id, destino);
  }

  @Patch(':destino/:id')
  @UseInterceptors(
    ArchivoConcurrencyInterceptor,
    FileInterceptor('imagen', ARCHIVO_UPLOAD_OPTIONS),
  )
  update(
    @Param('destino', new ParseEnumPipe(ImagenContenidoDestino))
    destino: ImagenContenidoDestino,
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile(crearPipeArchivo('imagenes')) imagen: Express.Multer.File,
  ): Promise<ArchivoResponseDto> {
    return this.service.update(id, imagen, destino);
  }

  @Delete(':destino/:id')
  remove(
    @Param('destino', new ParseEnumPipe(ImagenContenidoDestino))
    destino: ImagenContenidoDestino,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<string> {
    return this.service.remove(id, destino);
  }
}
