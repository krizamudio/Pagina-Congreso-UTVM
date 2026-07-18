import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { ArchivoResponseDto } from '../dto';
import { ArchivoMultimedia } from '../entities/archivo_multimedia.entity';
import { ArchivoMultimediaMapper } from '../mappers';
import { ResourceLockService } from '../../common/resource-lock.service';
import { ArchivoMultimediaService } from './archivo_multimedia.service';
import { perteneceACategoria } from './archivo-validation.helper';
import type { ArchivoCategoriaPublica } from './archivo-validation.helper';
import { ArchivoRetryService } from './archivo-retry.service';
import { SupabaseStorageService } from './supabase-storage.service';

const USUARIO_TEMPORAL_ID = 'e0efb875-4dc6-449b-8f45-832a728f2757';

@Injectable()
export class ArchivoStorageService {
  private readonly logger = new Logger(ArchivoStorageService.name);

  constructor(
    private readonly archivos: ArchivoMultimediaService,
    private readonly storage: SupabaseStorageService,
    private readonly retry: ArchivoRetryService,
    private readonly locks: ResourceLockService,
    private readonly mapper: ArchivoMultimediaMapper,
  ) {}

  async uploadFile(
    archivo: Express.Multer.File,
    categoria: ArchivoCategoriaPublica,
  ): Promise<ArchivoResponseDto> {
    const datos = await this.storage.upload(archivo, categoria);

    try {
      // TODO: Sustituir este UUID por el usuario autenticado.
      const creado = await this.archivos.create(
        this.mapper.toCreateData(datos, USUARIO_TEMPORAL_ID),
      );
      return this.mapper.toResponse(creado);
    } catch (error) {
      await this.retry.compensate(
        'limpiar archivo tras fallo de creacion',
        () => this.storage.remove(datos.path),
      );
      throw error;
    }
  }

  async getFile(
    id: string,
    categoria: ArchivoCategoriaPublica,
  ): Promise<ArchivoResponseDto> {
    const registro = await this.getRegistro(id, categoria);
    return this.mapper.toResponse(registro);
  }

  updateFile(
    id: string,
    archivo: Express.Multer.File,
    categoria: ArchivoCategoriaPublica,
  ): Promise<ArchivoResponseDto> {
    return this.locks.withLock(`archivo:${id}`, () =>
      this.updateLocked(id, archivo, categoria),
    );
  }

  deleteFile(id: string, categoria: ArchivoCategoriaPublica): Promise<string> {
    return this.locks.withLock(`archivo:${id}`, async () => {
      const registro = await this.getRegistro(id, categoria);
      await this.archivos.delete(registro);

      const eliminado = await this.retry.execute(
        'eliminar objeto durante borrado',
        () => this.storage.remove(registro.path),
      );
      if (!eliminado) {
        await this.retry.compensate('restaurar registro eliminado', () =>
          this.archivos.restore(registro),
        );
        throw this.storageException();
      }

      return 'Archivo eliminado correctamente';
    });
  }

  private async updateLocked(
    id: string,
    archivo: Express.Multer.File,
    categoria: ArchivoCategoriaPublica,
  ): Promise<ArchivoResponseDto> {
    const original = await this.getRegistro(id, categoria);
    const datosNuevos = await this.storage.upload(archivo, categoria);

    let actualizado: ArchivoMultimedia;
    try {
      actualizado = await this.archivos.update(
        id,
        this.mapper.toUpdateData(datosNuevos),
      );
    } catch (error) {
      await this.retry.compensate(
        'limpiar archivo tras fallo de actualizacion',
        () => this.storage.remove(datosNuevos.path),
      );
      throw error;
    }

    const anteriorEliminado = await this.retry.execute(
      'eliminar objeto anterior',
      () => this.storage.remove(original.path),
    );
    if (!anteriorEliminado) {
      this.logger.warn(
        `No se pudo eliminar el objeto anterior (${original.path}) tras actualizar el archivo ${id}. Se conserva el objeto nuevo.`,
      );
    }

    return this.mapper.toResponse(actualizado);
  }

  private async rollbackUpdate(
    id: string,
    original: ArchivoMultimedia,
    nuevoPath: string,
  ): Promise<void> {
    const registroRestaurado = await this.retry.compensate(
      'restaurar registro tras fallo de Supabase',
      () =>
        this.archivos.update(id, {
          path: original.path,
          ruta_archivo: original.ruta_archivo,
          tipo_mime: original.tipo_mime,
        }),
    );

    if (registroRestaurado) {
      await this.retry.compensate('eliminar objeto nuevo tras rollback', () =>
        this.storage.remove(nuevoPath),
      );
    } else {
      this.logger.error(
        `Se conserva el objeto nuevo para evitar una URL rota en el archivo ${id}`,
      );
    }
  }

  private async getRegistro(
    id: string,
    categoria: ArchivoCategoriaPublica,
  ): Promise<ArchivoMultimedia> {
    const registro = await this.archivos.findOne(id);
    if (!perteneceACategoria(registro, categoria)) {
      throw new NotFoundException('Archivo no encontrado');
    }
    return registro;
  }

  private storageException(): InternalServerErrorException {
    return new InternalServerErrorException(
      'No fue posible completar la operacion de almacenamiento',
    );
  }
}
