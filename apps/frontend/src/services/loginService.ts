import { api } from './api';

export interface ParticipanteLogin {
  id: string;
  nombreCompleto: string;
  correo: string;
  institucion?: string | null;
  carrera?: string;
}

export interface LoginResponse {
  mensaje: string;
  tipo: 'EXTERNO' | 'NSU';
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