import { Congreso } from '../entities/congreso.entity';
import { CongresoFindOneResponseDto } from '../dto/congreso-find-one.dto';



export class CongresoMapper {
  static toFindOneReponse(congreso: Congreso): CongresoFindOneResponseDto {
    return {
      id: congreso.id,
      nombre: congreso.nombre,
      eslogan: congreso.eslogan,
      ubicacion: congreso.ubicacion,
      fechaInicio: congreso.fecha_inicio,
      fechaFin: congreso.fecha_fin,
    };
  }
}
