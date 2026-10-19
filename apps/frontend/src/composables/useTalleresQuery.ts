import { ref } from "vue";
import { api } from "../services/api";
import type { Taller, TallerPayload } from "../types";

interface TallerApiResponse {
  id: string;
  titulo: string;
  descripcion: string;
  cupo_maximo: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  requisitos: string;

  inscritos?: number;
  porcentaje_ocupacion?: number;
  estado_cupo?: string;

  inscripciones?: Array<{
    id: string;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
  }>;

  created_at?: string;
  updated_at?: string;

  congreso_id?: string;
  tallerista_id?: string;
  ubicacion_id?: string;

  congreso?: {
    id: string;
    nombre: string;
  };

  ponente?: {
    id: string;
    nombre: string;
    institucion?: string;
    tema?: string;
    foto?: {
      id?: string;
      url?: string;
      ruta_archivo?: string;
      path?: string;
    } | null;
  };

  ubicacion?: {
    id: string;
    nombre: string;
    capacidad?: number;
  };
}

const normalizeTaller = (
  record: TallerApiResponse,
): Taller => {
  const inscritos = Number(
    record.inscritos ??
      record.inscripciones?.length ??
      0,
  );

  const porcentajeOcupacion =
    record.porcentaje_ocupacion ??
    (record.cupo_maximo > 0
      ? Math.round(
          (inscritos / record.cupo_maximo) * 100,
        )
      : 0);

  return {
    id: record.id,
    titulo: record.titulo,
    descripcion: record.descripcion,
    cupo_maximo: record.cupo_maximo,
    fecha: record.fecha,
    hora_inicio: record.hora_inicio,
    hora_fin: record.hora_fin,
    requisitos: record.requisitos,

    inscritos,
    porcentaje_ocupacion: porcentajeOcupacion,
    estado_cupo: record.estado_cupo,

    fecha_creacion: record.created_at ?? "",

    ...(record.updated_at
      ? {
          fecha_actualizacion: record.updated_at,
        }
      : {}),

    congreso_id:
      record.congreso_id ??
      record.congreso?.id ??
      "",

    tallerista_id:
      record.tallerista_id ??
      record.ponente?.id ??
      "",

    ubicacion_id:
      record.ubicacion_id ??
      record.ubicacion?.id ??
      "",

    ...(record.congreso
      ? {
          congreso: record.congreso,
        }
      : {}),

    ...(record.ponente
      ? {
          ponente: record.ponente,
        }
      : {}),

    ...(record.ubicacion
      ? {
          ubicacion: record.ubicacion,
        }
      : {}),

    ...(record.inscripciones
      ? {
          inscripciones: record.inscripciones,
        }
      : {}),
  };
};

const sanitizePayload = (
  payload: Partial<TallerPayload>,
): Partial<TallerPayload> => {
  const allowedKeys = [
    "congreso_id",
    "titulo",
    "descripcion",
    "tallerista_id",
    "cupo_maximo",
    "fecha",
    "hora_inicio",
    "hora_fin",
    "ubicacion_id",
    "requisitos",
  ] as const;

  return Object.fromEntries(
    allowedKeys
      .filter((key) => payload[key] !== undefined)
      .map((key) => [key, payload[key]]),
  ) as Partial<TallerPayload>;
};

export function useTalleresQuery() {
  const data = ref<Taller[]>([]);
  const isRefreshing = ref(false);
  const error = ref<string | null>(null);

  const load = async (): Promise<void> => {
    isRefreshing.value = true;
    error.value = null;

    try {
      const response =
        await api.get<TallerApiResponse[]>("/taller");

      data.value = response.data.map(normalizeTaller);
    } catch (err) {
      error.value = "Error cargando talleres";
      console.error(err);
    } finally {
      isRefreshing.value = false;
    }
  };

  const getById = async (
    id: string,
  ): Promise<Taller> => {
    const response =
      await api.get<TallerApiResponse>(
        `/taller/${id}`,
      );

    return normalizeTaller(response.data);
  };

  const create = async (
    payload: TallerPayload,
  ): Promise<Taller> => {
    const response =
      await api.post<TallerApiResponse>(
        "/taller",
        sanitizePayload(payload),
      );

    return normalizeTaller(response.data);
  };

  const update = async (
    id: string,
    payload: Partial<TallerPayload>,
  ): Promise<Taller> => {
    const response =
      await api.patch<TallerApiResponse>(
        `/taller/${id}`,
        sanitizePayload(payload),
      );

    return normalizeTaller(response.data);
  };

  const remove = async (
    id: string,
  ): Promise<void> => {
    await api.delete(`/taller/${id}`);
  };

  return {
    data,
    isRefreshing,
    error,
    load,
    getById,
    create,
    update,
    remove,
  };
}