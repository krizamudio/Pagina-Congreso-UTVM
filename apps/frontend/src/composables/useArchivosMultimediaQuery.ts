import { ref } from 'vue';
import { api } from '../services/api';
import type { ArchivoMultimedia } from '../types';

export function useArchivosMultimediaQuery() {
  const data = ref<ArchivoMultimedia[]>([]);
  const isRefreshing = ref(false);
  const error = ref<string | null>(null);

  const load = async () => {
    isRefreshing.value = true;
    error.value = null;

    try {
      const response = await api.get('archivo-multimedia');
      data.value = response.data as ArchivoMultimedia[];
    } catch (err) {
      error.value = 'Error cargando archivos multimedia';
      console.error(err);
    } finally {
      isRefreshing.value = false;
    }
  };

  return {
    data,
    isRefreshing,
    error,
    load,
  };
}
