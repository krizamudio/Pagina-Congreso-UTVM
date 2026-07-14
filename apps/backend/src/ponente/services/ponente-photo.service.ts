import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ArchivoMultimedia } from '../../archivo_multimedia/entities/archivo_multimedia.entity';
import { perteneceACategoria } from '../../archivo_multimedia/services/archivo-validation.helper';

@Injectable()
export class PonentePhotoService {
  constructor(
    @InjectRepository(ArchivoMultimedia)
    private readonly archivoRepository: Repository<ArchivoMultimedia>,
  ) {}

  async resolve(
    id?: string | null,
  ): Promise<ArchivoMultimedia | null | undefined> {
    if (id === undefined) return undefined;
    if (id === null) return null;

    const foto = await this.archivoRepository.findOneBy({ id });
    if (!foto || !perteneceACategoria(foto, 'imagenes')) {
      throw new NotFoundException('La foto indicada no existe');
    }

    return foto;
  }
}
