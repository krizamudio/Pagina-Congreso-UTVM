import { api } from './api';

export type TipoParticipanteLogin = 'EXTERNO' | 'NSU' | 'EMS' | 'UTVM';

export interface ParticipanteLogin {
  id: string;
  registroId?: string | null;
  nombreCompleto: string;
  correo: string;
  institucion?: string | null;
  carrera?: string;
  telefono?: string;
  cuatrimestre?: number;
  grupo?: string;
}

export interface LoginResponse {
  mensaje: string;
  tipo: TipoParticipanteLogin;
  participante: ParticipanteLogin;
}

export async function iniciarSesionPorCorreo(
  correo: string,
): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/login', {
    correo,
  });

  return response.data;
}
