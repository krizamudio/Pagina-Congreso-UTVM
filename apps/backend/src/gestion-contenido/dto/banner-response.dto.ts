import {
  ContenidoCongresoResponse,
  ContenidoImagenResponse,
} from './contenido-response.types';

export class BannerResponseDto {
  id!: string;
  titulo!: string | null;
  urlEnlace!: string | null;
  activo!: boolean;
  orden!: number;
  imagen!: ContenidoImagenResponse;
  congreso!: ContenidoCongresoResponse;
}
