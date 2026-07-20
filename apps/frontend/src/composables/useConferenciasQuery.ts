import { ref } from "vue";
import { api } from "../services/api";
import type { Conferencia, ConferenciaPayload } from "../types";

interface ConferenciaApiResponse {
  id: string;
  titulo: string;
  resumen: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  congreso_id?: string;
  ponente_id?: string;
  ubicacion_id?: string;
  congreso?: { id: string; nombre: string };
  ponente?: { id: string; nombre: string };
  ubicacion?: { id: string; nombre: string };
}

const normalizeConferencia = (record: ConferenciaApiResponse): Conferencia => ({
  id: record.id,
  titulo: record.titulo,
  resumen: record.resumen,
  fecha: record.fecha,
  hora_inicio: record.hora_inicio,
  hora_fin: record.hora_fin,
  congreso_id: record.congreso_id ?? record.congreso?.id ?? "",
  ponente_id: record.ponente_id ?? record.ponente?.id ?? "",
  ubicacion_id: record.ubicacion_id ?? record.ubicacion?.id ?? "",
  ...(record.congreso ? { congreso: record.congreso } : {}),
  ...(record.ponente ? { ponente: record.ponente } : {}),
  ...(record.ubicacion ? { ubicacion: record.ubicacion } : {})
});

const sanitizePayload = (
  payload: Partial<ConferenciaPayload>
): Partial<ConferenciaPayload> => {
  const allowedKeys = [
    "congreso_id",
    "titulo",
    "ponente_id",
    "resumen",
    "fecha",
    "hora_inicio",
    "hora_fin",
    "ubicacion_id"
  ] as const;

  return Object.fromEntries(
    allowedKeys
      .filter(key => payload[key] !== undefined)
      .map(key => [key, payload[key]])
  ) as Partial<ConferenciaPayload>;
};

export function useConferenciasQuery() {
  const data = ref<Conferencia[]>([]);
  const isRefreshing = ref(false);
  const error = ref<string | null>(null);

  const load = async () => {
    isRefreshing.value = true;
    error.value = null;

    try {
      const response = await api.get<ConferenciaApiResponse[]>("conferencias");
      data.value = response.data.map(normalizeConferencia);
    } catch (err) {
      error.value = "Error cargando conferencias";
      console.error(err);
    } finally {
      isRefreshing.value = false;
    }
  };

  const getById = async (id: string) => {
    const response = await api.get<ConferenciaApiResponse>(
      `conferencias/${id}`
    );
    return normalizeConferencia(response.data);
  };

  const create = async (payload: ConferenciaPayload) => {
    const response = await api.post<ConferenciaApiResponse>(
      "conferencias",
      sanitizePayload(payload)
    );
    return normalizeConferencia(response.data);
  };

  const update = async (id: string, payload: Partial<ConferenciaPayload>) => {
    const response = await api.patch<ConferenciaApiResponse>(
      `conferencias/${id}`,
      sanitizePayload(payload)
    );
    return normalizeConferencia(response.data);
  };

  const remove = async (id: string) => {
    await api.delete(`conferencias/${id}`);
  };

  return {
    data,
    isRefreshing,
    error,
    load,
    getById,
    create,
    update,
    remove
  };
}
