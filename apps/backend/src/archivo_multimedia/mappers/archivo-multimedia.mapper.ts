import { Injectable } from '@nestjs/common';

import { ArchivoResponseDto } from '../dto';
import { ArchivoMultimedia } from '../entities/archivo_multimedia.entity';
import type {
  ActualizarArchivoData,
  CrearArchivoData,
} from '../services/archivo_multimedia.service';
import type { ArchivoStorageData } from '../services/supabase-storage.service';

@Injectable()
export class ArchivoMultimediaMapper {
  toCreateData(
    data: ArchivoStorageData,
    subidoPorUsuarioId: string,
  ): CrearArchivoData {
    return {
      subido_por_usuario_id: subidoPorUsuarioId,
      ruta_archivo: data.url,
      path: data.path,
      tipo_mime: data.tipoMime,
    };
  }

  toUpdateData(data: ArchivoStorageData): ActualizarArchivoData {
    return {
      ruta_archivo: data.url,
      path: data.path,
      tipo_mime: data.tipoMime,
    };
  }

  toResponse(data: ArchivoMultimedia): ArchivoResponseDto {
    return {
      id: data.id,
      url: data.ruta_archivo,
      path: data.path,
      tipoMime: data.tipo_mime,
    };
  }
}
