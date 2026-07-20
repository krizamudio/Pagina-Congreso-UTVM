import { Congreso } from '../../congreso/entities/congreso.entity';
import { Ponente } from '../../ponente/entities/ponente.entity';
import { Ubicacion } from '../../ubicacion/entities/ubicacion.entity';

export interface AgendaRelationIds {
  congresoId: string;
  ubicacionId: string;
  ponenteId: string;
}

export interface AgendaRelations {
  congreso: Congreso;
  ubicacion: Ubicacion;
  ponente: Ponente;
}

export interface AgendaSlot {
  fecha: string;
  horaInicio: string;
  horaFin: string;
  ubicacionId: string;
  excludeConferenciaId?: string;
  excludeTallerId?: string;
}
