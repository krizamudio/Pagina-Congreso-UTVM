export interface PaginaImagenDto {
  id: string;
  url: string;
}

export interface PaginaSeccionDto {
  clave: string;
  titulo: string;
  cuerpo: string | null;
}

export interface PaginaNoticiaCardDto {
  id: string;
  titulo: string;
  slug: string;
  portada: PaginaImagenDto | null;
  fechaPublicacion: Date;
}

export interface PaginaBannerDto {
  id: string;
  titulo: string | null;
  urlEnlace: string | null;
  imagen: PaginaImagenDto;
  orden: number;
}

export interface PaginaAgendaItemDto {
  tipo: 'conferencia' | 'taller';
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  ubicacion: { id: string; nombre: string } | null;
  ponente: { id: string; nombre: string } | null;
}

export class PaginaOficialResponseDto {
  congreso!: { id: string; nombre: string };
  secciones!: PaginaSeccionDto[];
  noticias!: PaginaNoticiaCardDto[];
  banners!: PaginaBannerDto[];
  agenda!: PaginaAgendaItemDto[];
}

export interface PaginaNoticiaDetalleDto extends PaginaNoticiaCardDto {
  cuerpo: string;
}
