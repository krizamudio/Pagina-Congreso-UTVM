import { BannerResponseDto } from '../dto/banner-response.dto';
import { NoticiaResponseDto } from '../dto/noticia-response.dto';
import { SeccionContenidoResponseDto } from '../dto/seccion-contenido-response.dto';
import { Banner } from '../entities/banner.entity';
import { Noticia } from '../entities/noticia.entity';
import { SeccionContenido } from '../entities/seccion-contenido.entity';

export function mapNoticia(noticia: Noticia): NoticiaResponseDto {
  return {
    id: noticia.id,
    titulo: noticia.titulo,
    slug: noticia.slug,
    cuerpo: noticia.cuerpo,
    portada: noticia.portada
      ? { id: noticia.portada.id, url: noticia.portada.ruta_archivo }
      : null,
    estado: noticia.estado,
    fechaPublicacion: noticia.fecha_publicacion,
    congreso: { id: noticia.congreso.id, nombre: noticia.congreso.nombre },
  };
}

export function mapSeccion(
  seccion: SeccionContenido,
): SeccionContenidoResponseDto {
  return {
    id: seccion.id,
    clave: seccion.clave_seccion,
    titulo: seccion.titulo,
    cuerpo: seccion.cuerpo,
    estado: seccion.estado,
    congreso: { id: seccion.congreso.id, nombre: seccion.congreso.nombre },
  };
}

export function mapBanner(banner: Banner): BannerResponseDto {
  if (!banner.imagen) {
    throw new Error('Un banner activo debe tener imagen');
  }
  return {
    id: banner.id,
    titulo: banner.titulo,
    urlEnlace: banner.url_enlace,
    activo: banner.activo,
    orden: banner.orden,
    imagen: { id: banner.imagen.id, url: banner.imagen.ruta_archivo },
    congreso: { id: banner.congreso.id, nombre: banner.congreso.nombre },
  };
}
