import { PonenteTipo } from '../enums/ponente-tipo.enum';

export class ResponsePonenteDto {
  id!: string;
  usuarioId!: string;
  nombre!: string;
  foto?: { id: string; url: string } | undefined;
  institucion!: string;
  tipo!: PonenteTipo;
  semblanza!: string;
  tema!: string;
  visiblePublico?: boolean;
}
