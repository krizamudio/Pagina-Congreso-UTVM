import { ref } from 'vue';
import { api } from '../services/api';
import type { Taller, TallerPayload } from '../types';

export function useTalleresQuery() {
  const data = ref<Taller[]>([]);
  const isRefreshing = ref(false);
  const error = ref<string | null>(null);

  const load = async () => {
    isRefreshing.value = true;
    error.value = null;

    try {
      const response = await api.get('taller');
      data.value = response.data as Taller[];
    } catch (err) {
      error.value = 'Error cargando talleres';
      console.error(err);
    } finally {
      isRefreshing.value = false;
    }
  };

  const getById = async (id: string) => {
    const response = await api.get(`taller/${id}`);
    return response.data as Taller;
  };

  const create = async (payload: TallerPayload) => {
    const response = await api.post('taller', payload);
    return response.data as Taller;
  };

  const update = async (id: string, payload: Partial<TallerPayload>) => {
    const response = await api.patch(`taller/${id}`, payload);
    return response.data as Taller;
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
