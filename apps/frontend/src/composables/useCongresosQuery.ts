import { ref } from 'vue';
import { api } from '../services/api';
import type { Congreso, CongresoPayload } from '../types';

export function useCongresosQuery() {
  const data = ref<Congreso[]>([]);
  const isRefreshing = ref(false);
  const error = ref<string | null>(null);

  const load = async () => {
    isRefreshing.value = true;
    error.value = null;

    try {
      const response = await api.get<Congreso[] | { data: Congreso[] }>('congreso');

      if (Array.isArray(response.data)) {
        data.value = response.data;
      } else if (Array.isArray(response.data.data)) {
        data.value = response.data.data;
      } else {
        data.value = [];
      }
    } catch (err) {
      error.value = 'No se pudieron cargar los congresos.';
      data.value = [];
      console.error(err);
    } finally {
      isRefreshing.value = false;
    }
  };

  const getById = async (id: string) => {
    const response = await api.get<Congreso>(`congreso/${id}`);
    return response.data;
  };

  const create = async (payload: CongresoPayload) => {
    const response = await api.post<Congreso>('congreso', payload);
    return response.data;
  };

  const update = async (id: string, payload: Partial<CongresoPayload>) => {
    const response = await api.patch<Congreso>(`congreso/${id}`, payload);
    return response.data;
  };

  const remove = async (id: string) => {
    return api.delete(`congreso/${id}`);
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
