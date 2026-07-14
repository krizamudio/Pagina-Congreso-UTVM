import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { ArchivoResponseDto } from '../dto';
import { ArchivoMultimedia } from '../entities/archivo_multimedia.entity';
import { ArchivoMultimediaService } from './archivo_multimedia.service';
import type { ActualizarArchivoData } from './archivo_multimedia.service';
import { perteneceACategoria } from './archivo-validation.helper';
import type { ArchivoCategoria } from './archivo-validation.helper';
import { ArchivoLockService } from './archivo-lock.service';
import { ArchivoRetryService } from './archivo-retry.service';
import { SupabaseStorageService } from './supabase-storage.service';
import type { ArchivoStorageData } from './supabase-storage.service';

@Injectable()
export class ArchivoStorageService {
  private readonly logger = new Logger(ArchivoStorageService.name);

  constructor(
    private readonly archivos: ArchivoMultimediaService,
    private readonly storage: SupabaseStorageService,
    private readonly retry: ArchivoRetryService,
    private readonly locks: ArchivoLockService,
  ) {}

  async uploadFile(
    archivo: Express.Multer.File,
    categoria: ArchivoCategoria,
  ): Promise<string> {
    const datos = await this.storage.upload(archivo, categoria);

    try {
      return await this.archivos.create({
        // TODO: Sustituir este UUID por el usuario autenticado.
        subido_por_usuario_id: 'e0efb875-4dc6-449b-8f45-832a728f2757',
        ruta_archivo: datos.url,
        path: datos.path,
        tipo_mime: datos.tipoMime,
      });
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
    categoria: ArchivoCategoria,
  ): Promise<ArchivoResponseDto> {
    const registro = await this.getRegistro(id, categoria);
    return this.toResponse(registro);
  }

  updateFile(
    id: string,
    archivo: Express.Multer.File,
    categoria: ArchivoCategoria,
  ): Promise<ArchivoResponseDto> {
    return this.locks.withLock(id, () =>
      this.updateLocked(id, archivo, categoria),
    );
  }

  deleteFile(id: string, categoria: ArchivoCategoria): Promise<string> {
    return this.locks.withLock(id, async () => {
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
    categoria: ArchivoCategoria,
  ): Promise<ArchivoResponseDto> {
    const original = await this.getRegistro(id, categoria);
    const datosNuevos = await this.storage.upload(archivo, categoria);

    let actualizado: ArchivoMultimedia;
    try {
      actualizado = await this.archivos.update(
        id,
        this.toUpdateData(datosNuevos),
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
      await this.rollbackUpdate(id, original, datosNuevos.path);
      throw this.storageException();
    }

    return this.toResponse(actualizado);
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
    categoria: ArchivoCategoria,
  ): Promise<ArchivoMultimedia> {
    const registro = await this.archivos.findOne(id);
    if (!perteneceACategoria(registro, categoria)) {
      throw new NotFoundException('Archivo no encontrado');
    }
    return registro;
  }

  private toUpdateData(data: ArchivoStorageData): ActualizarArchivoData {
    return {
      path: data.path,
      ruta_archivo: data.url,
      tipo_mime: data.tipoMime,
    };
  }

  private toResponse(registro: ArchivoMultimedia): ArchivoResponseDto {
    return {
      id: registro.id,
      url: registro.ruta_archivo,
      path: registro.path,
      tipoMime: registro.tipo_mime,
    };
  }

  private storageException(): InternalServerErrorException {
    return new InternalServerErrorException(
      'No fue posible completar la operacion de almacenamiento',
    );
  }
}
