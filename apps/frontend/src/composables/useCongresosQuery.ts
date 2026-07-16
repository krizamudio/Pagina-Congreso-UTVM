import { ref } from "vue";
import { api } from "../services/api";
import type { Congreso, CongresoPayload } from "../types";

export function useCongresosQuery() {
  const data = ref<Congreso[]>([]);
  const isRefreshing = ref(false);
  const error = ref<string | null>(null);

  const load = async () => {
    isRefreshing.value = true;
    error.value = null;
    try {
      const response = await api.get<Congreso[]>("congreso");
      data.value = response.data;
    } catch (err) {
      error.value = "No se pudieron cargar los congresos.";
      console.error(err);
    } finally {
      isRefreshing.value = false;
    }
  };

  const getById = async (id: string) =>
    (await api.get<Congreso>(`congreso/${id}`)).data;
  const create = async (payload: CongresoPayload) =>
    (await api.post("congreso", payload)).data;
  const update = async (id: string, payload: Partial<CongresoPayload>) =>
    (await api.patch(`congreso/${id}`, payload)).data;
  const remove = async (id: string) => api.delete(`congreso/${id}`);

  return { data, isRefreshing, error, load, getById, create, update, remove };
}
