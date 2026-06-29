import { UploadedFile } from '../types/uploaded-file.type';

export class CreateParticipanteNsuDto {
  nombreCompleto!: string;
  correo!: string;
  institucion!: string;
  carrera!: string;
  telefono!: string;
  dias!: string;
  montoNumero!: number;
}

export class CreateRegistroNsuDto {
  participantes!: CreateParticipanteNsuDto[];
  comprobante!: UploadedFile;
}
