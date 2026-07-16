import { ref } from 'vue';
import { api } from '../services/api';
import type {
  ParticipanteEms,
  ParticipanteEmsPayload,
  ParticipanteExterno,
  ParticipanteExternoPayload,
  ParticipanteUtvm,
  ParticipanteUtvmPayload,
  RegistroNsu,
} from '../types';

type NsuEstadoPago = RegistroNsu['estado_pago'];
type ExternoStatus = ParticipanteExterno['status'];

export function useParticipantesAdmin() {
  const ems = ref<ParticipanteEms[]>([]);
  const utvm = ref<ParticipanteUtvm[]>([]);
  const nsu = ref<RegistroNsu[]>([]);
  const externos = ref<ParticipanteExterno[]>([]);
  const isRefreshing = ref(false);
  const error = ref<string | null>(null);

  const load = async () => {
    if (isRefreshing.value) return;

    isRefreshing.value = true;
    error.value = null;

    try {
      const emsResponse = await api.get('ems');
      const utvmResponse = await api.get('utvm');
      const nsuResponse = await api.get('registro-nsu');
      const externosResponse = await api.get('externos');

      ems.value = emsResponse.data as ParticipanteEms[];
      utvm.value = utvmResponse.data as ParticipanteUtvm[];
      nsu.value = nsuResponse.data as RegistroNsu[];
      externos.value = externosResponse.data as ParticipanteExterno[];
    } catch (err) {
      error.value = 'No se pudieron cargar los participantes.';
      console.error(err);
    } finally {
      isRefreshing.value = false;
    }
  };

  const createEms = async (payload: ParticipanteEmsPayload) => {
    const response = await api.post('ems', payload);
    return response.data as ParticipanteEms;
  };

  const updateEms = async (id: number, payload: Partial<ParticipanteEmsPayload>) => {
    const response = await api.patch(`ems/${id}`, payload);
    return response.data as ParticipanteEms;
  };

  const removeEms = async (id: number) => {
    await api.delete(`ems/${id}`);
  };

  const createUtvm = async (payload: ParticipanteUtvmPayload) => {
    const response = await api.post('utvm', payload);
    return response.data as ParticipanteUtvm;
  };

  const updateUtvm = async (id: number, payload: Partial<ParticipanteUtvmPayload>) => {
    const response = await api.patch(`utvm/${id}`, payload);
    return response.data as ParticipanteUtvm;
  };

  const removeUtvm = async (id: number) => {
    await api.delete(`utvm/${id}`);
  };

  const updateNsuStatus = async (id: string, estado_pago: NsuEstadoPago) => {
    const response = await api.patch(`registro-nsu/${id}`, { estado_pago });
    return response.data as RegistroNsu;
  };
  const getNsuById = async (id: string) => {
    const response = await api.get(`registro-nsu/${id}`);
    return response.data as RegistroNsu;
  };


  const removeNsu = async (id: string) => {
    await api.delete(`registro-nsu/${id}`);
  };

  const updateNsuParticipantStatus = async (
    registroId: string,
    participanteId: string,
    estado_pago: NsuEstadoPago,
  ) => {
    const response = await api.patch(
      `registro-nsu/${registroId}/participantes/${participanteId}`,
      { estado_pago },
    );
    return response.data as RegistroNsu;
  };

  const removeNsuParticipant = async (registroId: string, participanteId: string) => {
    const response = await api.delete(
      `registro-nsu/${registroId}/participantes/${participanteId}`,
    );
    return response.data as RegistroNsu;
  };

  const updateExterno = async (id: string, payload: Partial<ParticipanteExternoPayload>) => {
    const response = await api.patch(`externos/${id}`, payload);
    return response.data as ParticipanteExterno;
  };

  const updateExternoStatus = async (id: string, status: ExternoStatus) => {
    return updateExterno(id, { status });
  };

  const removeExterno = async (id: string) => {
    await api.delete(`externos/${id}`);
  };

  return {
    ems,
    utvm,
    nsu,
    externos,
    isRefreshing,
    error,
    load,
    createEms,
    updateEms,
    removeEms,
    createUtvm,
    updateUtvm,
    removeUtvm,
    updateNsuStatus,
    getNsuById,
    removeNsu,
    updateNsuParticipantStatus,
    removeNsuParticipant,
    updateExterno,
    updateExternoStatus,
    removeExterno,
  };
}
