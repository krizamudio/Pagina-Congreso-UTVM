import { ref } from 'vue';
import { api } from '../services/api';
import type { Conferencia, ConferenciaPayload } from '../types';

export function useConferenciasQuery() {
  const data = ref<Conferencia[]>([]);
  const isRefreshing = ref(false);
  const error = ref<string | null>(null);

  const load = async () => {
    isRefreshing.value = true;
    error.value = null;

    try {
      const response = await api.get('conferencias');
      data.value = response.data as Conferencia[];
    } catch (err) {
      error.value = 'Error cargando conferencias';
      console.error(err);
    } finally {
      isRefreshing.value = false;
    }
  };

  const getById = async (id: string) => {
    const response = await api.get(`conferencias/${id}`);
    return response.data as Conferencia;
  };

  const create = async (payload: ConferenciaPayload) => {
    const response = await api.post('conferencias', payload);
    return response.data as Conferencia;
  };

  const update = async (id: string, payload: Partial<ConferenciaPayload>) => {
    const response = await api.patch(`conferencias/${id}`, payload);
    return response.data as Conferencia;
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
    remove,
  };
}
