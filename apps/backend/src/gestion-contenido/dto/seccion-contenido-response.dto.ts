import { ContenidoCongresoResponse } from './contenido-response.types';
import { ContenidoEstado } from '../enums/contenido-estado.enum';

export class SeccionContenidoResponseDto {
  id!: string;
  clave!: string;
  titulo!: string;
  cuerpo!: string | null;
  estado!: ContenidoEstado;
  congreso!: ContenidoCongresoResponse;
}
