export class ForoEmpresarialResponseDto {
  id!: string;
  nombre!: string;
  logo!: { id: string; url: string } | null;
  direccion!: string;
  resena!: string;
  congreso!: { id: string; nombre: string };
  ubicacion!: { id: string; nombre: string };
}
