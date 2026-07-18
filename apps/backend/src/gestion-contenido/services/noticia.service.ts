import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { DatabaseErrorHandlerService } from '../../common/database/handle-database-error';
import { ResourceLockService } from '../../common/resource-lock.service';
import { validatePatch } from '../../common/validation/patch.validator';
import { CreateNoticiaDto } from '../dto/create-noticia.dto';
import { NoticiaResponseDto } from '../dto/noticia-response.dto';
import { UpdateNoticiaDto } from '../dto/update-noticia.dto';
import { Noticia } from '../entities/noticia.entity';
import { ContenidoEstado } from '../enums/contenido-estado.enum';
import { ImagenContenidoDestino } from '../enums/imagen-contenido-destino.enum';
import { mapNoticia } from '../mappers/contenido.mapper';
import { ContenidoArchivoService } from './contenido-archivo.service';
import { ContenidoImagenLifecycleService } from './contenido-imagen-lifecycle.service';
import { ContenidoRelationsService } from './contenido-relations.service';
import { ContenidoSlugService } from './contenido-slug.service';

@Injectable()
export class NoticiaService {
  private readonly relations = { congreso: true, portada: true } as const;

  constructor(
    @InjectRepository(Noticia)
    private readonly repository: Repository<Noticia>,
    private readonly dataSource: DataSource,
    private readonly relationsService: ContenidoRelationsService,
    private readonly archivos: ContenidoArchivoService,
    private readonly lifecycle: ContenidoImagenLifecycleService,
    private readonly slugs: ContenidoSlugService,
    private readonly locks: ResourceLockService,
    private readonly dbErrors: DatabaseErrorHandlerService,
  ) {}

  async create(dto: CreateNoticiaDto): Promise<NoticiaResponseDto> {
    const { congreso_id, archivo_portada_id, estado, ...data } = dto;
    const [congreso, portada, slug] = await Promise.all([
      this.relationsService.findCongreso(congreso_id),
      this.archivos.resolvePortada(archivo_portada_id),
      this.slugs.generate(dto.titulo),
    ]);
    const finalState = estado ?? ContenidoEstado.BORRADOR;
    const noticia = this.repository.create({
      ...data,
      slug,
      congreso,
      portada: portada ?? null,
      estado: finalState,
      fecha_publicacion:
        finalState === ContenidoEstado.PUBLICADO ? new Date() : null,
    });

    try {
      return mapNoticia(await this.repository.save(noticia));
    } catch (error) {
      this.dbErrors.handle(error);
    }
  }

  async findAll(): Promise<NoticiaResponseDto[]> {
    const noticias = await this.repository.find({
      relations: this.relations,
      order: { created_at: 'DESC' },
    });
    return noticias.map(mapNoticia);
  }

  async findOne(id: string): Promise<NoticiaResponseDto> {
    return mapNoticia(await this.findEntity(id));
  }

  update(id: string, dto: UpdateNoticiaDto): Promise<NoticiaResponseDto> {
    validatePatch(dto, ['congreso_id', 'titulo', 'cuerpo', 'estado']);
    return this.locks.withLock(`noticia:${id}`, () =>
      this.updateLocked(id, dto),
    );
  }

  remove(id: string): Promise<string> {
    return this.locks.withLock(`noticia:${id}`, () => this.removeLocked(id));
  }

  private async updateLocked(
    id: string,
    dto: UpdateNoticiaDto,
  ): Promise<NoticiaResponseDto> {
    const noticia = await this.findEntity(id);
    const original = this.repository.create({ ...noticia });
    const { congreso_id, archivo_portada_id, estado, ...data } = dto;
    const [congreso, portada] = await Promise.all([
      congreso_id ? this.relationsService.findCongreso(congreso_id) : undefined,
      archivo_portada_id === undefined
        ? undefined
        : this.archivos.resolvePortada(archivo_portada_id, id),
    ]);

    this.repository.merge(noticia, {
      ...data,
      ...(congreso ? { congreso } : {}),
      ...(archivo_portada_id !== undefined ? { portada: portada ?? null } : {}),
      ...(estado ? this.publicationState(noticia, estado) : {}),
    });
    try {
      await this.repository.save(noticia);
    } catch (error) {
      this.dbErrors.handle(error);
    }

    await this.lifecycle.cleanupPrevious(
      noticia.portada,
      original.portada,
      ImagenContenidoDestino.NOTICIAS,
      () => this.repository.save(original).then(() => undefined),
    );
    return mapNoticia(noticia);
  }

  private async removeLocked(id: string): Promise<string> {
    const noticia = await this.findEntity(id);
    const original = this.repository.create({ ...noticia });

    try {
      await this.dataSource.transaction(async (manager) => {
        noticia.portada = null;
        await manager.save(Noticia, noticia);
        await manager.softDelete(Noticia, id);
      });
    } catch (error) {
      this.dbErrors.handle(error);
    }

    await this.lifecycle.cleanupPrevious(
      null,
      original.portada,
      ImagenContenidoDestino.NOTICIAS,
      async () => {
        await this.repository.restore(id);
        await this.repository.save(original);
      },
    );
    return 'Noticia eliminada correctamente';
  }

  private publicationState(
    current: Noticia,
    estado: ContenidoEstado,
  ): Pick<Noticia, 'estado' | 'fecha_publicacion'> {
    return {
      estado,
      fecha_publicacion:
        estado === ContenidoEstado.PUBLICADO
          ? (current.fecha_publicacion ?? new Date())
          : null,
    };
  }

  private async findEntity(id: string): Promise<Noticia> {
    const noticia = await this.repository.findOne({
      where: { id },
      relations: this.relations,
    });
    if (!noticia) throw new NotFoundException('Noticia no encontrada');
    return noticia;
  }
}
