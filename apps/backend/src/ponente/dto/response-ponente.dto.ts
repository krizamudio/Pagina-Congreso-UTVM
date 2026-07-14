export class ResponsePonenteDto {
  id!: string;
  usuarioId!: string;
  nombre!: string;
  foto?: { url: string } | undefined;
  institucion!: string;
  semblanza!: string;
  tema!: string;
  visiblePublico?: boolean;
}
