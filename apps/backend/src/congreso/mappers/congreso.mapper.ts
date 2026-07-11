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

  static toFindAllResponse(
    congresos: Congreso[],
  ): CongresoFindOneResponseDto[] {
    const congresosMappeados: CongresoFindOneResponseDto[] = 
    congresos.map((c: Congreso) =>{

      const congreso: CongresoFindOneResponseDto = {
        id: c.id,
        nombre: c.nombre,
        eslogan: c.eslogan,
        ubicacion: c.ubicacion,
        fechaInicio: c.fecha_inicio,
        fechaFin: c.fecha_fin,
      }
      return congreso;
    });

    return congresosMappeados;
  }
}
