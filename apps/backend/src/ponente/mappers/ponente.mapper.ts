import { ResponsePonenteDto } from '../dto/response-ponente.dto';
import { Ponente } from '../entities/ponente.entity';

export function mapPonenteToResponse(data: Ponente): ResponsePonenteDto {
  return {
    id: data.id,
    usuarioId: data.usuario_id,
    nombre: data.nombre,
    foto: data.foto ? { url: data.foto.ruta_archivo } : undefined,
    institucion: data.institucion,
    semblanza: data.semblanza,
    tema: data.tema,
    visiblePublico: data.visible_publico,
  };
}
