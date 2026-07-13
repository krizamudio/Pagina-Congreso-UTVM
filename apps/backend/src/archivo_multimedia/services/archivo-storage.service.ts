import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

import { GeneradorCommon } from '../../common/generador.common';
import { ArchivoResponseDto } from '../dto';
import { ArchivoMultimedia } from '../entities/archivo_multimedia.entity';
import {
  ActualizarArchivoData,
  ArchivoMultimediaService,
} from './archivo_multimedia.service';
import {
  ArchivoCategoria,
  obtenerExtensionArchivo,
  perteneceACategoria,
} from './archivo-validation.helper';
import { SupabaseService } from './supabase.service';

const MAX_INTENTOS_COMPENSACION = 3;
const RETRY_BASE_DELAY_MS = 100;

@Injectable()
export class ArchivoStorageService {
  private readonly logger = new Logger(ArchivoStorageService.name);
  private readonly supabase: SupabaseClient;
  private readonly bucket: string;
  private readonly operationLocks = new Map<string, Promise<void>>();

  constructor(
    private readonly generador: GeneradorCommon,
    private readonly archivos: ArchivoMultimediaService,
  ) {
    this.supabase = SupabaseService();
    this.bucket = process.env.SUPABASE_BUCKET ?? 'congreso-imagenes';
  }

  async uploadFile(
    archivo: Express.Multer.File,
    categoria: ArchivoCategoria,
  ): Promise<string> {
    const nuevoPath = this.crearPath(archivo, categoria);
    await this.uploadObject(nuevoPath, archivo);
    const datos = this.buildStorageData(nuevoPath, archivo.mimetype);

    try {
      return await this.archivos.create({
        // TODO: Sustituir este UUID por el usuario autenticado.
        subido_por_usuario_id: 'e0efb875-4dc6-449b-8f45-832a728f2757',
        ruta_archivo: datos.url,
        path: datos.path,
        tipo_mime: datos.tipoMime,
      });
    } catch (error) {
      await this.compensate('limpiar archivo tras fallo de creacion', () =>
        this.removeObject(nuevoPath),
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
    return this.withFileLock(id, async () => {
      const registroOriginal = await this.getRegistro(id, categoria);
      const nuevoPath = this.crearPath(archivo, categoria);
      await this.uploadObject(nuevoPath, archivo);
      const datosNuevos = this.buildStorageData(nuevoPath, archivo.mimetype);

      let actualizado: ArchivoMultimedia;
      try {
        actualizado = await this.archivos.update(id, {
          path: datosNuevos.path,
          ruta_archivo: datosNuevos.url,
          tipo_mime: datosNuevos.tipoMime,
        });
      } catch (error) {
        await this.compensate(
          'limpiar archivo tras fallo de actualizacion',
          () => this.removeObject(nuevoPath),
        );
        throw error;
      }

      const anteriorEliminado = await this.tryWithRetries(
        'eliminar objeto anterior',
        () => this.removeObject(registroOriginal.path),
      );

      if (!anteriorEliminado) {
        const original: ActualizarArchivoData = {
          path: registroOriginal.path,
          ruta_archivo: registroOriginal.ruta_archivo,
          tipo_mime: registroOriginal.tipo_mime,
        };
        const registroRestaurado = await this.compensate(
          'restaurar registro tras fallo de Supabase',
          () => this.archivos.update(id, original),
        );

        if (registroRestaurado) {
          await this.compensate('eliminar objeto nuevo tras rollback', () =>
            this.removeObject(nuevoPath),
          );
        } else {
          this.logger.error(
            `Se conserva el objeto nuevo para evitar una URL rota en el archivo ${id}`,
          );
        }
        throw this.storageException();
      }

      return this.toResponse(actualizado);
    });
  }

  deleteFile(id: string, categoria: ArchivoCategoria): Promise<string> {
    return this.withFileLock(id, async () => {
      const registro = await this.getRegistro(id, categoria);
      await this.archivos.delete(registro);

      const objetoEliminado = await this.tryWithRetries(
        'eliminar objeto durante borrado',
        () => this.removeObject(registro.path),
      );

      if (!objetoEliminado) {
        await this.compensate('restaurar registro eliminado', () =>
          this.archivos.restore(registro),
        );
        throw this.storageException();
      }

      return 'Archivo eliminado correctamente';
    });
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

  private async uploadObject(
    path: string,
    archivo: Express.Multer.File,
  ): Promise<void> {
    try {
      const { error } = await this.supabase.storage
        .from(this.bucket)
        .upload(path, archivo.buffer, {
          contentType: archivo.mimetype,
          cacheControl: '0',
          upsert: false,
        });

      if (error) throw error;
    } catch (error) {
      this.logger.error(
        `Fallo al subir objeto a Supabase: ${this.errorDetail(error)}`,
      );
      throw this.storageException();
    }
  }

  private async removeObject(path: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(this.bucket)
      .remove([path]);
    if (error) throw error;
  }

  private async compensate(
    descripcion: string,
    operation: () => Promise<unknown>,
  ): Promise<boolean> {
    const completada = await this.tryWithRetries(descripcion, operation);
    if (!completada) {
      this.logger.error(`No fue posible compensar: ${descripcion}`);
    }
    return completada;
  }

  private async tryWithRetries(
    descripcion: string,
    operation: () => Promise<unknown>,
  ): Promise<boolean> {
    for (let intento = 1; intento <= MAX_INTENTOS_COMPENSACION; intento += 1) {
      try {
        await operation();
        return true;
      } catch (error) {
        this.logger.warn(
          `${descripcion} (intento ${intento}/${MAX_INTENTOS_COMPENSACION}): ${this.errorDetail(error)}`,
        );
        if (intento < MAX_INTENTOS_COMPENSACION) {
          await this.delay(this.retryDelay(intento));
        }
      }
    }
    return false;
  }

  private async withFileLock<T>(
    id: string,
    operation: () => Promise<T>,
  ): Promise<T> {
    const previous = this.operationLocks.get(id) ?? Promise.resolve();
    let release!: () => void;
    const current = new Promise<void>((resolve) => {
      release = resolve;
    });
    const tail = previous.then(() => current);
    this.operationLocks.set(id, tail);

    await previous;
    try {
      return await operation();
    } finally {
      release();
      if (this.operationLocks.get(id) === tail) {
        this.operationLocks.delete(id);
      }
    }
  }

  private retryDelay(intento: number): number {
    const exponential = RETRY_BASE_DELAY_MS * 2 ** (intento - 1);
    const jitter = Math.floor(Math.random() * RETRY_BASE_DELAY_MS);
    return exponential + jitter;
  }

  private delay(milliseconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  private crearPath(
    archivo: Express.Multer.File,
    categoria: ArchivoCategoria,
  ): string {
    const extension = obtenerExtensionArchivo(archivo, categoria);
    return `${categoria}/${this.generador.CadenasAleatorias()}.${extension}`;
  }

  private buildStorageData(
    path: string,
    tipoMime: string,
  ): Omit<ArchivoResponseDto, 'id'> {
    // El contrato actual usa URLs publicas porque el bucket es publico.
    const { data } = this.supabase.storage.from(this.bucket).getPublicUrl(path);
    return { url: data.publicUrl, path, tipoMime };
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

  private errorDetail(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
