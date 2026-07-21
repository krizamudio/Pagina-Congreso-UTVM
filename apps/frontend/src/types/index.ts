export type PonenteTipo = "Ponente" | "Panelista";

export type ReconocimientoEstado = "PENDIENTE" | "EMITIDO" | "FALLIDO";
export type ReconocimientoTipo = "GENERAL" | "TALLERISTA" | "CONFERENCISTA";

export interface ReconocimientoReferencia {
  id: string;
  nombre?: string;
  titulo?: string;
  tipo?: PonenteTipo;
}

export interface Reconocimiento {
  id: string;
  nombre_destinatario: string;
  tipo: ReconocimientoTipo;
  estado: ReconocimientoEstado;
  intentos: number;
  primera_fecha_emision?: string | null;
  created_at: string;
  taller?: ReconocimientoReferencia | null;
  conferencia?: ReconocimientoReferencia | null;
  ponente?: ReconocimientoReferencia | null;
  congreso?: ReconocimientoReferencia | null;
}

export interface ReconocimientosPage {
  data: Reconocimiento[];
  total: number;
  page: number;
  limit: number;
}

export interface Ponente {
  id: string;

  // Backend nuevo
  usuarioId?: string;
  visiblePublico?: boolean;
  foto?: {
    id: string;
    url: string;
  };

  // Compatibilidad con frontend viejo/admin
  usuario_id?: string;
  archivo_foto_id?: string | null;
  visible_publico?: boolean;

  nombre: string;
  institucion: string;
  tipo: PonenteTipo;
  semblanza: string;
  tema: string;
}

export type PonentePayload = Omit<Ponente, "id" | "foto" | "usuarioId" | "visiblePublico">;

export type Panel = Ponente;
export type PanelPayload = PonentePayload;

export interface ConferenciaReferencia {
  id: string;
  nombre: string;
}

export interface Conferencia {
  id: string;
  titulo: string;
  resumen: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;

  congreso_id?: string | null;
  ponente_id?: string | null;
  ubicacion_id?: string | null;

  congreso?: {
    id: string;
    nombre: string;
  } | null;

  ponente?: {
    id: string;
    nombre: string;
    institucion?: string;
    semblanza?: string;
    tema?: string;
    visible_publico?: boolean;
  } | null;

  ubicacion?: {
    id: string;
    nombre: string;
    capacidad?: number;
  } | null;

  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

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
  congreso?: ConferenciaReferencia;
  ponente?: ConferenciaReferencia;
  ubicacion?: ConferenciaReferencia;
}

export type TallerPayload = Omit<
  Taller,
  | "id"
  | "fecha_creacion"
  | "fecha_actualizacion"
  | "congreso"
  | "ponente"
  | "ubicacion"
>;

export interface Congreso {
  id: string;
  nombre: string;
  eslogan: string;
  ubicacion: string;
  fechaInicio: string;
  fechaFin: string;
}

export interface CongresoPayload {
  nombre: string;
  eslogan: string;
  ubicacion: string;
  fecha_inicio: string;
  fecha_fin: string;
}

export interface Ubicacion {
  id: string;
  nombre: string;
  capacidad: number;
}

export type UbicacionPayload = Omit<Ubicacion, "id">;

export interface ForoEmpresarialReferencia {
  id: string;
  nombre: string;
}

export interface ForoEmpresarialLogo {
  id: string;
  url: string;
}

export interface ForoEmpresarial {
  id: string;
  nombre: string;
  logo: ForoEmpresarialLogo | null;
  direccion: string;
  resena: string;
  congreso: ForoEmpresarialReferencia;
  ubicacion: ForoEmpresarialReferencia;
}

export interface ForoEmpresarialPayload {
  nombre: string;
  archivo_logo_id?: string | null;
  direccion: string;
  resena: string;
  congreso_id: string;
  ubicacion_id: string;
}

export interface ForoEmpresarialFormSubmit {
  foro: Omit<ForoEmpresarialPayload, "archivo_logo_id">;
  logo: File | null;
  eliminarLogo: boolean;
}

export type ParticipanteTipo = "ems" | "utvm" | "nsu" | "externo";
export type ParticipanteEstatus = "pendiente" | "validado" | "rechazado";

export interface ArchivoComprobante {
  id: string;
  nombre_original: string;
  mime_type: string;
  size: number;
}

export interface ParticipanteEms {
  id: number;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno?: string | null;
  correo: string;
  institucion: string;
  carrera: string;
  telefono: string;
  created_at?: string;
  updated_at?: string;
}

export type ParticipanteEmsPayload = Omit<
  ParticipanteEms,
  "id" | "created_at" | "updated_at"
>;

export interface ParticipanteUtvm {
  id: number;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno?: string | null;
  correo: string;
  cuatrimestre: number;
  grupo: string;
  telefono: string;
  created_at?: string;
  updated_at?: string;
}

export type ParticipanteUtvmPayload = Omit<
  ParticipanteUtvm,
  "id" | "created_at" | "updated_at"
>;

export interface ParticipanteNsuDetalle {
  id: string;
  es_tutor: boolean;
  correo_verificado: boolean;
  nombre_completo: string;
  correo: string;
  institucion: string;
  carrera: string;
  telefono: string;
  dias: string;
  monto_individual: number;
  estado_pago?: "PENDIENTE" | "VALIDADO" | "RECHAZADO";
}

export interface RegistroNsu {
  id: string;
  total_general: number;
  total_participantes: number;
  estado_pago: "PENDIENTE" | "VALIDADO" | "RECHAZADO";
  participantes: ParticipanteNsuDetalle[];
  comprobante: ArchivoComprobante | null;
  created_at: string;
  updated_at: string;
}

export interface ParticipanteExterno {
  id: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string | null;
  correo: string;
  telefono: string;
  institucion?: string | null;
  dias: string[];
  total: number;
  comprobante: ArchivoComprobante | null;
  correoVerificado: boolean;
  status: "pendiente_verificacion" | "pendiente" | "validado" | "rechazado";
  createdAt: string;
  updatedAt: string;
}

export type ParticipanteExternoPayload = Omit<
  ParticipanteExterno,
  "id" | "comprobante" | "createdAt" | "updatedAt"
>;
