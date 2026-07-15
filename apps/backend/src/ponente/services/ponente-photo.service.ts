import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { ArchivoMultimedia } from '../../archivo_multimedia/entities/archivo_multimedia.entity';
import { perteneceACategoria } from '../../archivo_multimedia/services/archivo-validation.helper';
import {
  ArchivoMultimediaService,
  ArchivoStorageService,
} from '../../archivo_multimedia/services';

@Injectable()
export class PonentePhotoService {
  private readonly logger = new Logger(PonentePhotoService.name);

  constructor(
    private readonly archivos: ArchivoMultimediaService,
    private readonly storage: ArchivoStorageService,
  ) {}

  async resolve(
    id?: string | null,
  ): Promise<ArchivoMultimedia | null | undefined> {
    if (id === undefined) return undefined;
    if (id === null) return null;

    let foto: ArchivoMultimedia;
    try {
      foto = await this.archivos.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('La foto indicada no existe');
      }
      throw error;
    }

    if (!perteneceACategoria(foto, 'imagenes')) {
      throw new NotFoundException('La foto indicada no existe');
    }

    return foto;
  }

  async cleanupPrevious(
    currentPhoto: ArchivoMultimedia | null | undefined,
    previousPhoto: ArchivoMultimedia | null | undefined,
    rollback: () => Promise<void>,
  ): Promise<void> {
    if (!previousPhoto || previousPhoto.id === currentPhoto?.id) return;

    try {
      await this.storage.deleteFile(previousPhoto.id, 'imagenes');
    } catch (error) {
      await this.compensate(rollback);
      const trace = error instanceof Error ? error.stack : undefined;
      this.logger.error('No se pudo eliminar la foto anterior', trace);
      throw new InternalServerErrorException('No se pudo realizar la accion');
    }
  }

  private async compensate(rollback: () => Promise<void>): Promise<void> {
    try {
      await rollback();
    } catch (error) {
      const trace = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        'No se pudo restaurar el ponente tras el fallo de limpieza',
        trace,
      );
    }
  }
}
