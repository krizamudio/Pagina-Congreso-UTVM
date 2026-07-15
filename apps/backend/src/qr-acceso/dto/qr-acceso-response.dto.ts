import { ParticipanteTipo } from '../../participante-acceso/participante-tipo.enum';
import { QrResultado } from '../qr-resultado.enum';

export class QrAccesoResponseDto {
  valido!: true;
  puedeIngresar!: true;
  resultado!: QrResultado.VALIDO;
  participante!: {
    id: string;
    nombreCompleto: string;
    tipo: ParticipanteTipo;
  };
  congreso!: {
    id: string;
    nombre: string;
  };
  dia!: {
    id: string;
    fecha: string;
    accesoUtilizado: boolean;
    fechaIngreso?: Date;
  };
}
