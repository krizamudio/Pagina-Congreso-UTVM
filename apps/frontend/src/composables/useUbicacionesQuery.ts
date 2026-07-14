import { ref } from "vue";
import { api } from "../services/api";
import type { Ubicacion, UbicacionPayload } from "../types";

export function useUbicacionesQuery() {
  const data = ref<Ubicacion[]>([]);
  const isRefreshing = ref(false);
  const error = ref<string | null>(null);

  const load = async () => {
    isRefreshing.value = true;
    error.value = null;
    try {
      const response = await api.get<Ubicacion[]>("ubicacion");
      data.value = response.data;
    } catch (err) {
      error.value = "No se pudieron cargar las ubicaciones.";
      console.error(err);
    } finally {
      isRefreshing.value = false;
    }
  };

  const getById = async (id: string) =>
    (await api.get<Ubicacion>(`ubicacion/${id}`)).data;
  const create = async (payload: UbicacionPayload) =>
    (await api.post("ubicacion", payload)).data;
  const update = async (id: string, payload: Partial<UbicacionPayload>) =>
    (await api.patch(`ubicacion/${id}`, payload)).data;
  const remove = async (id: string) => api.delete(`ubicacion/${id}`);

  return { data, isRefreshing, error, load, getById, create, update, remove };
}
