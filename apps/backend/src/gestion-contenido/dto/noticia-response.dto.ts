import {
  ContenidoCongresoResponse,
  ContenidoImagenResponse,
} from './contenido-response.types';
import { ContenidoEstado } from '../enums/contenido-estado.enum';

export class NoticiaResponseDto {
  id!: string;
  titulo!: string;
  slug!: string;
  cuerpo!: string;
  portada!: ContenidoImagenResponse | null;
  estado!: ContenidoEstado;
  fechaPublicacion!: Date | null;
  congreso!: ContenidoCongresoResponse;
}
