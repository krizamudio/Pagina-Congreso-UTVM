import { ParticipanteResuelto } from '../../participante-acceso/interfaces/participante-resuelto.interface';
import { ParticipanteTipo } from '../../participante-acceso/participante-tipo.enum';

export interface EmitirQrAccesoData {
  tipo: ParticipanteTipo;
  referenciaId: string;
  congresoId: string;
  diaEventoIds: string[];
}

export interface QrAccesoEmitido {
  codigoQrId: string;
  participante: ParticipanteResuelto;
  accessUrl: string;
  qrPng: Buffer;
}
