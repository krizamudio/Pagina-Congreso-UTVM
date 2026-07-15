export type QrParticipantType = "EMS" | "UTVM" | "EXTERNO" | "NSU";

export interface QrSendResponse {
  mensaje: string;
  participante_id: string;
}

export interface QrAccessResponse {
  valido: true;
  puedeIngresar: true;
  resultado: "QR_VALIDO";
  participante: {
    id: string;
    nombreCompleto: string;
    tipo: QrParticipantType;
  };
  congreso: {
    id: string;
    nombre: string;
  };
  dia: {
    id: string;
    fecha: string;
    accesoUtilizado: boolean;
    fechaIngreso?: string;
  };
}

export interface QrDomainError {
  message?: string | string[];
  resultado?: string;
}
