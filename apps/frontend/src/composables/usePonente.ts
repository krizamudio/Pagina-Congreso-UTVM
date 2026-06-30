import { ref } from 'vue';
import { api } from '../services/api';
import type { Ponente, PonentePayload } from '../types';

export function usePonente() {
  const useGetPonentes = (limit = 50, offset = 0) => {
    const data = ref<Ponente[]>([]);
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    const refetch = async () => {
      isLoading.value = true;
      try {
        const response = await api.get('ponente', {
          params: { limit, offset },
        });
        data.value = response.data as Ponente[];
      } catch (err) {
        error.value = 'Error cargando ponentes';
        console.error(err);
      } finally {
        isLoading.value = false;
      }
    };

    return {
      data,
      isLoading,
      error,
      refetch,
    };
  };

  const useGetPonenteById = (id: string) => {
    const data = ref<Ponente | null>(null);
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    const fetch = async () => {
      if (!id) return;
      isLoading.value = true;
      try {
        const response = await api.get(`ponente/${id}`);
        data.value = response.data as Ponente;
      } catch (err) {
        error.value = 'Error cargando ponente';
        console.error(err);
      } finally {
        isLoading.value = false;
      }
    };

    return {
      data,
      isLoading,
      error,
      fetch,
    };
  };

  const useCreatePonente = () => {
    const isPending = ref(false);
    const error = ref<string | null>(null);

    const mutate = async (payload: PonentePayload) => {
      isPending.value = true;
      try {
        const response = await api.post('ponente', payload);
        return response.data as Ponente;
      } catch (err) {
        error.value = 'Error creando ponente';
        console.error(err);
        throw err;
      } finally {
        isPending.value = false;
      }
    };

    return {
      mutate,
      isPending,
      error,
    };
  };

  const useUpdatePonente = () => {
    const isPending = ref(false);
    const error = ref<string | null>(null);

    const mutate = async (
      id: string,
      payload: Partial<PonentePayload>
    ) => {
      isPending.value = true;
      try {
        const response = await api.patch(`ponente/${id}`, payload);
        return response.data as Ponente;
      } catch (err) {
        error.value = 'Error actualizando ponente';
        console.error(err);
        throw err;
      } finally {
        isPending.value = false;
      }
    };

    return {
      mutate,
      isPending,
      error,
    };
  };

  const useDeletePonente = () => {
    const isPending = ref(false);
    const error = ref<string | null>(null);

    const mutate = async (id: string) => {
      isPending.value = true;
      try {
        const response = await api.delete(`ponente/${id}`);
        return response.data as Ponente;
      } catch (err) {
        error.value = 'Error eliminando ponente';
        console.error(err);
        throw err;
      } finally {
        isPending.value = false;
      }
    };

    return {
      mutate,
      isPending,
      error,
    };
  };

  return {
    useGetPonentes,
    useGetPonenteById,
    useCreatePonente,
    useUpdatePonente,
    useDeletePonente,
  };
}
