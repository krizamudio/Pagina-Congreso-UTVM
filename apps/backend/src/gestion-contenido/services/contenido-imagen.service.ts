import { Injectable } from '@nestjs/common';

import { ArchivoResponseDto } from '../../archivo_multimedia/dto';
import { ArchivoStorageService } from '../../archivo_multimedia/services';
import { ImagenContenidoDestino } from '../enums/imagen-contenido-destino.enum';

@Injectable()
export class ContenidoImagenService {
  constructor(private readonly storage: ArchivoStorageService) {}

  upload(
    archivo: Express.Multer.File,
    destino: ImagenContenidoDestino,
  ): Promise<ArchivoResponseDto> {
    return this.storage.uploadFile(archivo, 'imagenes', destino);
  }

  findOne(
    id: string,
    destino: ImagenContenidoDestino,
  ): Promise<ArchivoResponseDto> {
    return this.storage.getFile(id, 'imagenes', destino);
  }

  update(
    id: string,
    archivo: Express.Multer.File,
    destino: ImagenContenidoDestino,
  ): Promise<ArchivoResponseDto> {
    return this.storage.updateFile(id, archivo, 'imagenes', destino);
  }

  remove(id: string, destino: ImagenContenidoDestino): Promise<string> {
    return this.storage.deleteFile(id, 'imagenes', destino);
  }
}
