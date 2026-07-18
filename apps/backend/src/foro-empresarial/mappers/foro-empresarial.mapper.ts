import { Injectable } from '@nestjs/common';

import { ForoEmpresarialResponseDto } from '../dto/foro-empresarial-response.dto';
import { ForoEmpresarial } from '../entities/foro-empresarial.entity';

@Injectable()
export class ForoEmpresarialMapper {
  toResponse(foro: ForoEmpresarial): ForoEmpresarialResponseDto {
    return {
      id: foro.id,
      nombre: foro.nombre,
      logo: foro.logo
        ? { id: foro.logo.id, url: foro.logo.ruta_archivo }
        : null,
      direccion: foro.direccion,
      resena: foro.resena,
      congreso: { id: foro.congreso.id, nombre: foro.congreso.nombre },
      ubicacion: { id: foro.ubicacion.id, nombre: foro.ubicacion.nombre },
    };
  }
}
