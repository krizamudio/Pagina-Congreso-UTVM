import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

export interface ParticipanteNsuPayload {
  nombreCompleto: string;
  correo: string;
  institucion: string;
  carrera: string;
  telefono: string;
  dias: string;
  montoNumero: number;
}

export async function guardarRegistroNsu(
  participantes: ParticipanteNsuPayload[],
  comprobante: File,
) {
  const formData = new FormData();

  formData.append('participantes', JSON.stringify(participantes));
  formData.append('comprobante', comprobante);

  const response = await api.post('/registro-nsu', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}