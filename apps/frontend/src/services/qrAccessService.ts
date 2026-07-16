import axios from "axios";

import type {
  QrAccessResponse,
  QrDomainError,
  QrParticipantType,
  QrSendResponse
} from "../types/qr-access";
import { api } from "./api";

export const qrAccessService = {
  async sendAutomatic(
    type: QrParticipantType,
    participantId: string | number,
    registrationId?: string
  ): Promise<QrSendResponse> {
    const endpoints = {
      EMS: `ems/${participantId}/qr-acceso/enviar-automatico`,
      UTVM: `utvm/${participantId}/qr-acceso/enviar-automatico`,
      EXTERNO: `externos/${participantId}/qr-acceso/enviar-automatico`,
      NSU: `registro-nsu/${registrationId}/participantes/${participantId}/qr-acceso/enviar-automatico`
    };
    const response = await api.post<QrSendResponse>(endpoints[type]);
    return response.data;
  },

  async inspect(token: string): Promise<QrAccessResponse> {
    const response = await api.get<QrAccessResponse>(`acceso/qr/${token}`);
    return response.data;
  },

  async confirm(token: string): Promise<QrAccessResponse> {
    const response = await api.post<QrAccessResponse>(
      `acceso/qr/${token}/confirmar`
    );
    return response.data;
  }
};

export function getQrApiError(error: unknown): string {
  if (!axios.isAxiosError<QrDomainError>(error)) {
    return "No fue posible completar la operación.";
  }

  const data = error.response?.data;
  const message = data?.message;
  if (Array.isArray(message)) return message.join(", ");
  if (message) return message;
  if (data?.resultado) return data.resultado;
  return "No fue posible comunicarse con el servidor.";
}
