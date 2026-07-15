export interface DatosCorreoQrAcceso {
  destinatario: string;
  nombreParticipante: string;
  nombreCongreso: string;
  accessUrl: string;
  qrPng: Buffer;
  nombreArchivo?: string;
}
