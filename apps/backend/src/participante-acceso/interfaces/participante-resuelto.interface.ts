import { ParticipanteTipo } from '../participante-tipo.enum';

export interface ParticipanteResuelto {
  tipo: ParticipanteTipo;
  referenciaId: string;
  nombreCompleto: string;
  correo: string;
}
