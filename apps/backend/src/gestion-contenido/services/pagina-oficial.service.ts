import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';

import { Conferencia } from '../../conferencia/entities/conferencia.entity';
import { Congreso } from '../../congreso/entities/congreso.entity';
import { Taller } from '../../taller/entities/taller.entity';
import {
  PaginaAgendaItemDto,
  PaginaNoticiaDetalleDto,
  PaginaOficialResponseDto,
} from '../dto/pagina-oficial-response.dto';
import { Banner } from '../entities/banner.entity';
import { Noticia } from '../entities/noticia.entity';
import { SeccionContenido } from '../entities/seccion-contenido.entity';
import { ContenidoEstado } from '../enums/contenido-estado.enum';

@Injectable()
export class PaginaOficialService {
  constructor(
    @InjectRepository(Congreso)
    private readonly congresos: Repository<Congreso>,
    @InjectRepository(Noticia)
    private readonly noticias: Repository<Noticia>,
    @InjectRepository(SeccionContenido)
    private readonly secciones: Repository<SeccionContenido>,
    @InjectRepository(Banner)
    private readonly banners: Repository<Banner>,
    @InjectRepository(Conferencia)
    private readonly conferencias: Repository<Conferencia>,
    @InjectRepository(Taller)
    private readonly talleres: Repository<Taller>,
  ) {}

  async findPage(congresoId: string): Promise<PaginaOficialResponseDto> {
    const congreso = await this.congresos.findOneBy({ id: congresoId });
    if (!congreso) throw new NotFoundException('Congreso no encontrado');

    const [sections, news, banners, conferences, workshops] = await Promise.all(
      [
        this.secciones.find({
          where: {
            congreso: { id: congresoId },
            estado: ContenidoEstado.PUBLICADO,
          },
          order: { clave_seccion: 'ASC' },
        }),
        this.noticias.find({
          where: {
            congreso: { id: congresoId },
            estado: ContenidoEstado.PUBLICADO,
            fecha_publicacion: LessThanOrEqual(new Date()),
          },
          relations: { portada: true },
          order: { fecha_publicacion: 'DESC' },
        }),
        this.banners.find({
          where: { congreso: { id: congresoId }, activo: true },
          relations: { imagen: true },
          order: { orden: 'ASC', created_at: 'ASC' },
        }),
        this.conferencias.find({
          where: { congreso: { id: congresoId } },
          relations: { ubicacion: true, ponente: true },
        }),
        this.talleres.find({
          where: { congreso: { id: congresoId } },
          relations: { ubicacion: true, ponente: true },
        }),
      ],
    );

    return {
      congreso: { id: congreso.id, nombre: congreso.nombre },
      secciones: sections.map((item) => ({
        clave: item.clave_seccion,
        titulo: item.titulo,
        cuerpo: item.cuerpo,
      })),
      noticias: news.map((item) => ({
        id: item.id,
        titulo: item.titulo,
        slug: item.slug,
        portada: item.portada
          ? { id: item.portada.id, url: item.portada.ruta_archivo }
          : null,
        fechaPublicacion: item.fecha_publicacion!,
      })),
      banners: banners
        .filter((item) => item.imagen)
        .map((item) => ({
          id: item.id,
          titulo: item.titulo,
          urlEnlace: item.url_enlace,
          imagen: { id: item.imagen!.id, url: item.imagen!.ruta_archivo },
          orden: item.orden,
        })),
      agenda: this.mapAgenda(conferences, workshops),
    };
  }

  async findNews(slug: string): Promise<PaginaNoticiaDetalleDto> {
    const noticia = await this.noticias.findOne({
      where: {
        slug,
        estado: ContenidoEstado.PUBLICADO,
        fecha_publicacion: LessThanOrEqual(new Date()),
      },
      relations: { portada: true },
    });
    if (!noticia) throw new NotFoundException('Noticia no encontrada');
    return {
      id: noticia.id,
      titulo: noticia.titulo,
      slug: noticia.slug,
      cuerpo: noticia.cuerpo,
      portada: noticia.portada
        ? { id: noticia.portada.id, url: noticia.portada.ruta_archivo }
        : null,
      fechaPublicacion: noticia.fecha_publicacion!,
    };
  }

  private mapAgenda(
    conferences: Conferencia[],
    workshops: Taller[],
  ): PaginaAgendaItemDto[] {
    const items: PaginaAgendaItemDto[] = [
      ...conferences.map((item) =>
        this.mapActivity('conferencia', item, item.resumen),
      ),
      ...workshops.map((item) =>
        this.mapActivity('taller', item, item.descripcion),
      ),
    ];
    return items.sort((a, b) =>
      `${a.fecha}T${a.horaInicio}`.localeCompare(`${b.fecha}T${b.horaInicio}`),
    );
  }

  private mapActivity(
    tipo: 'conferencia' | 'taller',
    item: Conferencia | Taller,
    descripcion: string,
  ): PaginaAgendaItemDto {
    return {
      tipo,
      id: item.id,
      titulo: item.titulo,
      descripcion,
      fecha:
        item.fecha instanceof Date
          ? item.fecha.toISOString().slice(0, 10)
          : item.fecha,
      horaInicio: item.hora_inicio,
      horaFin: item.hora_fin,
      ubicacion: item.ubicacion
        ? { id: item.ubicacion.id, nombre: item.ubicacion.nombre }
        : null,
      ponente: item.ponente
        ? { id: item.ponente.id, nombre: item.ponente.nombre }
        : null,
    };
  }
}
