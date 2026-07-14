import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';

import { GeneradorCommon } from '../../common/generador.common';
import { obtenerExtensionArchivo } from './archivo-validation.helper';
import type { ArchivoCategoria } from './archivo-validation.helper';
import { createSupabaseClient } from './supabase-client.factory';

export interface ArchivoStorageData {
  url: string;
  path: string;
  tipoMime: string;
}

@Injectable()
export class SupabaseStorageService {
  private readonly logger = new Logger(SupabaseStorageService.name);
  private readonly supabase: SupabaseClient;
  private readonly bucket: string;

  constructor(private readonly generador: GeneradorCommon) {
    this.supabase = createSupabaseClient();
    this.bucket = process.env.SUPABASE_BUCKET ?? 'congreso-imagenes';
  }

  async upload(
    archivo: Express.Multer.File,
    categoria: ArchivoCategoria,
  ): Promise<ArchivoStorageData> {
    const extension = obtenerExtensionArchivo(archivo, categoria);
    const path = `${categoria}/${this.generador.CadenasAleatorias()}.${extension}`;

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

    // El contrato actual usa URLs publicas porque el bucket es publico.
    const { data } = this.supabase.storage.from(this.bucket).getPublicUrl(path);
    return { url: data.publicUrl, path, tipoMime: archivo.mimetype };
  }

  async remove(path: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(this.bucket)
      .remove([path]);
    if (error) throw error;
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
