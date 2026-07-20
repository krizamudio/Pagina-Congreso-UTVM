import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

import {
  obtenerExtensionArchivo,
  type ArchivoSubido,
} from '../archivo_multimedia/services/archivo-validation.helper';
import { createSupabaseClient } from '../archivo_multimedia/services/supabase-client.factory';

export type ComprobanteOrigen = 'nsu' | 'externos';

@Injectable()
export class ComprobanteStorageService {
  private readonly logger = new Logger(ComprobanteStorageService.name);
  private readonly supabase: SupabaseClient = createSupabaseClient();
  private readonly bucket =
    process.env.SUPABASE_VOUCHERS_BUCKET ?? 'comprobantes-pago';

  async upload(
    archivo: ArchivoSubido,
    origen: ComprobanteOrigen,
  ): Promise<string> {
    const extension = obtenerExtensionArchivo(archivo, 'comprobantes');
    const path = `${origen}/${randomUUID()}.${extension}`;

    try {
      const { error } = await this.supabase.storage
        .from(this.bucket)
        .upload(path, archivo.buffer, {
          contentType: archivo.mimetype,
          cacheControl: '0',
          upsert: false,
        });
      if (error) throw error;
      return path;
    } catch (error) {
      this.logger.error(
        `Fallo al subir comprobante a Supabase: ${this.errorDetail(error)}`,
      );
      throw this.storageException();
    }
  }

  async createSignedUrl(path: string): Promise<string> {
    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucket)
        .createSignedUrl(path, 5 * 60);
      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      this.logger.error(
        `Fallo al firmar acceso a comprobante: ${this.errorDetail(error)}`,
      );
      throw this.storageException();
    }
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
