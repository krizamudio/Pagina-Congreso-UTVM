export interface Ponente {
  id: string;
  usuario_id: string;
  nombre: string;
  archivo_foto_id: string;
  institucion: string;
  semblanza: string;
  tema: string;
  visible_publico?: boolean;
}

export type PonentePayload = Omit<Ponente, 'id'>;

export type Panel = Ponente;
export type PanelPayload = PonentePayload;

export interface Conferencia {
  id: string;
  congreso_id: string;
  titulo: string;
  ponente_id: string;
  resumen: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  ubicacion_id: string;
}

export type ConferenciaPayload = Omit<Conferencia, 'id'>;

export interface Taller {
  id: string;
  congreso_id: string;
  titulo: string;
  descripcion: string;
  tallerista_id: string;
  cupo_maximo: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  ubicacion_id: string;
  requisitos: string;
  fecha_creacion: string;
  fecha_actualizacion?: string;
}

export type TallerPayload = Omit<Taller, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>;
