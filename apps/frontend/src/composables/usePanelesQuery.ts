import { ref } from 'vue';
import { api } from '../services/api';
import type { Panel } from '../types';

export function usePanelesQuery() {
  const data = ref<Panel[]>([]);
  const isRefreshing = ref(false);
  const error = ref<string | null>(null);

  const load = async () => {
    isRefreshing.value = true;
    error.value = null;

    try {
      const response = await api.get('ponente');
      data.value = response.data as Panel[];
    } catch (err) {
      error.value = 'Error cargando paneles';
      console.error(err);
    } finally {
      isRefreshing.value = false;
    }
  };

  const remove = async (id: string) => {
    await api.delete(`ponente/${id}`);
  };

  return {
    data,
    isRefreshing,
    error,
    load,
    remove,
  };
}
