// dto/congreso-find-one-response.dto.ts

export class CongresoFindOneResponseDto {
  id!: string;
  nombre!: string;
  eslogan!: string;
  ubicacion!: string;
  fechaInicio!: Date;
  fechaFin!: Date;
}