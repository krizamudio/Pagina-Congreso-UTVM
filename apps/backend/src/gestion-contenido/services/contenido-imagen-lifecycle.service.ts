import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import { ArchivoMultimedia } from '../../archivo_multimedia/entities/archivo_multimedia.entity';
import { ArchivoStorageService } from '../../archivo_multimedia/services';
import { ImagenContenidoDestino } from '../enums/imagen-contenido-destino.enum';

@Injectable()
export class ContenidoImagenLifecycleService {
  private readonly logger = new Logger(ContenidoImagenLifecycleService.name);

  constructor(private readonly storage: ArchivoStorageService) {}

  async cleanupPrevious(
    current: ArchivoMultimedia | null | undefined,
    previous: ArchivoMultimedia | null | undefined,
    destino: ImagenContenidoDestino,
    rollback: () => Promise<void>,
  ): Promise<void> {
    if (!previous || previous.id === current?.id) return;

    try {
      await this.storage.deleteFile(previous.id, 'imagenes', destino);
    } catch (error) {
      const restored = await this.compensate('restaurar contenido', rollback);
      if (current && restored) {
        await this.compensate('retirar imagen nueva', () =>
          this.storage.deleteFile(current.id, 'imagenes', destino),
        );
      } else if (current) {
        this.logger.error(
          'Se conserva la imagen nueva porque no se pudo restaurar la relación',
        );
      }
      this.logger.error(
        'No se pudo limpiar la imagen anterior',
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('No se pudo realizar la acción');
    }
  }

  private async compensate(
    description: string,
    operation: () => Promise<unknown>,
  ): Promise<boolean> {
    try {
      await operation();
      return true;
    } catch (error) {
      this.logger.error(
        `No se pudo ${description}`,
        error instanceof Error ? error.stack : undefined,
      );
      return false;
    }
  }
}
