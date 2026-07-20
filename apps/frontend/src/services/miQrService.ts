import { api } from './api';
import type { ParticipanteLogin, TipoParticipanteLogin } from './loginService';

export interface ReenviarQrResponse {
  mensaje: string;
  participante_id?: string;
}

export async function reenviarMiQr(
  tipo: TipoParticipanteLogin,
  participante: ParticipanteLogin,
): Promise<ReenviarQrResponse> {
  if (!participante?.id) {
    throw new Error('No se encontró el participante en la sesión.');
  }

  if (tipo === 'EXTERNO') {
    const response = await api.post<ReenviarQrResponse>(
      `/externos/${participante.id}/qr-acceso/enviar-automatico`,
    );

    return response.data;
  }

  if (tipo === 'NSU') {
    if (!participante.registroId) {
      throw new Error(
        'No se encontró el registro NSU del participante. Vuelve a iniciar sesión.',
      );
    }

    const response = await api.post<ReenviarQrResponse>(
      `/registro-nsu/${participante.registroId}/participantes/${participante.id}/qr-acceso/enviar-automatico`,
    );

    return response.data;
  }

  if (tipo === 'EMS') {
    const response = await api.post<ReenviarQrResponse>(
      `/ems/${participante.id}/qr-acceso/enviar-automatico`,
    );

    return response.data;
  }

  if (tipo === 'UTVM') {
    const response = await api.post<ReenviarQrResponse>(
      `/utvm/${participante.id}/qr-acceso/enviar-automatico`,
    );

    return response.data;
  }

  throw new Error('Tipo de participante no válido.');
}
