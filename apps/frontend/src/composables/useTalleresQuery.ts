import { ref } from 'vue';
import { api } from '../services/api';
import type { Taller, TallerPayload } from '../types';

interface TallerApiResponse {
  id: string;
  titulo: string;
  descripcion: string;
  cupo_maximo: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  requisitos: string;
  created_at?: string;
  updated_at?: string;
  congreso_id?: string;
  tallerista_id?: string;
  ubicacion_id?: string;
  congreso?: { id: string; nombre: string };
  ponente?: { id: string; nombre: string };
  ubicacion?: { id: string; nombre: string };
}

const normalizeTaller = (record: TallerApiResponse): Taller => ({
  id: record.id,
  titulo: record.titulo,
  descripcion: record.descripcion,
  cupo_maximo: record.cupo_maximo,
  fecha: record.fecha,
  hora_inicio: record.hora_inicio,
  hora_fin: record.hora_fin,
  requisitos: record.requisitos,
  fecha_creacion: record.created_at ?? '',
  ...(record.updated_at ? { fecha_actualizacion: record.updated_at } : {}),
  congreso_id: record.congreso_id ?? record.congreso?.id ?? '',
  tallerista_id: record.tallerista_id ?? record.ponente?.id ?? '',
  ubicacion_id: record.ubicacion_id ?? record.ubicacion?.id ?? '',
  ...(record.congreso ? { congreso: record.congreso } : {}),
  ...(record.ponente ? { ponente: record.ponente } : {}),
  ...(record.ubicacion ? { ubicacion: record.ubicacion } : {}),
});

export function useTalleresQuery() {
  const data = ref<Taller[]>([]);
  const isRefreshing = ref(false);
  const error = ref<string | null>(null);

  const load = async () => {
    isRefreshing.value = true;
    error.value = null;

    try {
      const response = await api.get<TallerApiResponse[]>('taller');
      data.value = response.data.map(normalizeTaller);
    } catch (err) {
      error.value = 'Error cargando talleres';
      console.error(err);
    } finally {
      isRefreshing.value = false;
    }
  };

  const getById = async (id: string) => {
    const response = await api.get<TallerApiResponse>(`taller/${id}`);
    return normalizeTaller(response.data);
  };

  const create = async (payload: TallerPayload) => {
    const response = await api.post<TallerApiResponse>('taller', payload);
    return normalizeTaller(response.data);
  };

  const update = async (id: string, payload: Partial<TallerPayload>) => {
    const response = await api.patch<TallerApiResponse>(`taller/${id}`, payload);
    return normalizeTaller(response.data);
  };

  const remove = async (id: string) => {
    await api.delete(`taller/${id}`);
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
