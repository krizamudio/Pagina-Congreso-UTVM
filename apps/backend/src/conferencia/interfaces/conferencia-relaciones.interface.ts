import { Congreso } from '../../congreso/entities/congreso.entity';
import { Ponente } from '../../ponente/entities/ponente.entity';
import { Ubicacion } from '../../ubicacion/entities/ubicacion.entity';

export interface ConferenciaRelacionIds {
  congreso_id?: string;
  ubicacion_id?: string;
  ponente_id?: string;
}

export interface ConferenciaRelaciones {
  congreso?: Pick<Congreso, 'id'>;
  ubicacion?: Pick<Ubicacion, 'id'>;
  ponente?: Pick<Ponente, 'id'>;
}
