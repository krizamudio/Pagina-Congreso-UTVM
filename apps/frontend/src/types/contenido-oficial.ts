export type EstadoContenido = "borrador" | "publicado";
export type DestinoImagenContenido = "noticias" | "banners";

export interface ContenidoReferencia {
  id: string;
  nombre: string;
}

export interface ImagenContenido {
  id: string;
  url: string;
}

export interface ArchivoContenido extends ImagenContenido {
  path: string;
  tipoMime: string;
}

export interface NoticiaContenido {
  id: string;
  titulo: string;
  slug: string;
  cuerpo: string;
  portada: ImagenContenido | null;
  estado: EstadoContenido;
  fechaPublicacion: string | null;
  congreso: ContenidoReferencia;
}

export interface NoticiaContenidoPayload {
  congreso_id: string;
  titulo: string;
  cuerpo: string;
  archivo_portada_id?: string | null;
  estado?: EstadoContenido;
}

export interface SeccionContenido {
  id: string;
  clave: string;
  titulo: string;
  cuerpo: string | null;
  estado: EstadoContenido;
  congreso: ContenidoReferencia;
}

export interface SeccionContenidoPayload {
  congreso_id: string;
  clave_seccion: string;
  titulo: string;
  cuerpo?: string | null;
  estado?: EstadoContenido;
}

export interface BannerContenido {
  id: string;
  titulo: string | null;
  urlEnlace: string | null;
  activo: boolean;
  orden: number;
  imagen: ImagenContenido;
  congreso: ContenidoReferencia;
}

export interface BannerContenidoPayload {
  congreso_id: string;
  archivo_multimedia_id: string;
  titulo?: string | null;
  url_enlace?: string | null;
  activo?: boolean;
  orden?: number;
}

export interface AgendaPaginaOficialItem {
  tipo: "conferencia" | "taller";
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  ubicacion: ContenidoReferencia | null;
  ponente: ContenidoReferencia | null;
}

export interface PaginaOficialContenido {
  congreso: ContenidoReferencia;
  secciones: Array<{
    clave: string;
    titulo: string;
    cuerpo: string | null;
  }>;
  noticias: Array<{
    id: string;
    titulo: string;
    slug: string;
    portada: ImagenContenido | null;
    fechaPublicacion: string;
  }>;
  banners: Array<{
    id: string;
    titulo: string | null;
    urlEnlace: string | null;
    imagen: ImagenContenido;
    orden: number;
  }>;
  agenda: AgendaPaginaOficialItem[];
}
