import { CreateConferenciaDto } from '../dto/create-conferencia.dto';
import { UpdateConferenciaDto } from '../dto/update-conferencia.dto';
import { ConferenciaRelacionIds } from '../interfaces/conferencia-relaciones.interface';

type ConferenciaDto = CreateConferenciaDto | UpdateConferenciaDto;
type ConferenciaRelacionKeys = keyof ConferenciaRelacionIds;

type DatosConferenciaSeparados<T extends ConferenciaDto> = {
  relacionIds: ConferenciaRelacionIds;
  datosConferencia: Omit<T, ConferenciaRelacionKeys>;
};

export function separarDatosConferencia<T extends ConferenciaDto>(
  dto: T,
): DatosConferenciaSeparados<T> {
  const { congreso_id, ubicacion_id, ponente_id, ...datosConferencia } = dto;

  return {
    relacionIds: {
      congreso_id,
      ubicacion_id,
      ponente_id,
    },
    datosConferencia,
  } as DatosConferenciaSeparados<T>;
}
