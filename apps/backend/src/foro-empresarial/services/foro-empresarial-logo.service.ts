import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';

import { ArchivoMultimedia } from '../../archivo_multimedia/entities/archivo_multimedia.entity';
import { perteneceADestino } from '../../archivo_multimedia/services/archivo-validation.helper';
import {
  ArchivoMultimediaService,
  ArchivoStorageService,
} from '../../archivo_multimedia/services';
import { Ponente } from '../../ponente/entities/ponente.entity';
import { ForoEmpresarial } from '../entities/foro-empresarial.entity';

@Injectable()
export class ForoEmpresarialLogoService {
  private readonly logger = new Logger(ForoEmpresarialLogoService.name);

  constructor(
    private readonly archivos: ArchivoMultimediaService,
    private readonly storage: ArchivoStorageService,
    @InjectRepository(ForoEmpresarial)
    private readonly foros: Repository<ForoEmpresarial>,
    @InjectRepository(Ponente)
    private readonly ponentes: Repository<Ponente>,
  ) {}

  async resolve(
    id?: string | null,
    currentForoId?: string,
  ): Promise<ArchivoMultimedia | null | undefined> {
    if (id === undefined) return undefined;
    if (id === null) return null;

    let logo: ArchivoMultimedia;
    try {
      logo = await this.archivos.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('El logo indicado no existe');
      }
      throw error;
    }

    if (!perteneceADestino(logo, 'imagenes')) {
      throw new NotFoundException('El logo indicado no existe');
    }
    await this.ensureAvailable(id, currentForoId);
    return logo;
  }

  private async ensureAvailable(
    archivoId: string,
    currentForoId?: string,
  ): Promise<void> {
    const [usedByForo, usedByPonente] = await Promise.all([
      this.foros.exists({
        where: {
          logo: { id: archivoId },
          ...(currentForoId ? { id: Not(currentForoId) } : {}),
        },
      }),
      this.ponentes.exists({ where: { foto: { id: archivoId } } }),
    ]);
    if (usedByForo || usedByPonente) {
      throw new ConflictException(
        'El archivo indicado ya está asignado a otro registro',
      );
    }
  }

  async cleanupPrevious(
    currentLogo: ArchivoMultimedia | null | undefined,
    previousLogo: ArchivoMultimedia | null | undefined,
    rollback: () => Promise<void>,
  ): Promise<void> {
    if (!previousLogo || previousLogo.id === currentLogo?.id) return;

    try {
      await this.storage.deleteFile(previousLogo.id, 'imagenes');
    } catch (error) {
      await this.compensate(rollback);
      const trace = error instanceof Error ? error.stack : undefined;
      this.logger.error('No se pudo eliminar el logo anterior', trace);
      throw new InternalServerErrorException('No se pudo realizar la acción');
    }
  }

  private async compensate(rollback: () => Promise<void>): Promise<void> {
    try {
      await rollback();
    } catch (error) {
      const trace = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        'No se pudo restaurar el foro tras el fallo de limpieza',
        trace,
      );
    }
  }
}
