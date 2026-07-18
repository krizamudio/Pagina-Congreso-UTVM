import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { DatabaseErrorHandlerService } from '../../common/database/handle-database-error';
import { ResourceLockService } from '../../common/resource-lock.service';
import { validatePatch } from '../../common/validation/patch.validator';
import { BannerResponseDto } from '../dto/banner-response.dto';
import { CreateBannerDto } from '../dto/create-banner.dto';
import { UpdateBannerDto } from '../dto/update-banner.dto';
import { Banner } from '../entities/banner.entity';
import { ImagenContenidoDestino } from '../enums/imagen-contenido-destino.enum';
import { mapBanner } from '../mappers/contenido.mapper';
import { ContenidoArchivoService } from './contenido-archivo.service';
import { ContenidoImagenLifecycleService } from './contenido-imagen-lifecycle.service';
import { ContenidoRelationsService } from './contenido-relations.service';

@Injectable()
export class BannerService {
  private readonly relations = { congreso: true, imagen: true } as const;

  constructor(
    @InjectRepository(Banner)
    private readonly repository: Repository<Banner>,
    private readonly dataSource: DataSource,
    private readonly relationsService: ContenidoRelationsService,
    private readonly archivos: ContenidoArchivoService,
    private readonly lifecycle: ContenidoImagenLifecycleService,
    private readonly locks: ResourceLockService,
    private readonly dbErrors: DatabaseErrorHandlerService,
  ) {}

  async create(dto: CreateBannerDto): Promise<BannerResponseDto> {
    const { congreso_id, archivo_multimedia_id, ...data } = dto;
    const [congreso, imagen] = await Promise.all([
      this.relationsService.findCongreso(congreso_id),
      this.archivos.resolveBanner(archivo_multimedia_id),
    ]);
    const banner = this.repository.create({
      ...data,
      titulo: data.titulo ?? null,
      url_enlace: data.url_enlace ?? null,
      activo: data.activo ?? true,
      orden: data.orden ?? 0,
      congreso,
      imagen,
    });

    try {
      return mapBanner(await this.repository.save(banner));
    } catch (error) {
      this.dbErrors.handle(error);
    }
  }

  async findAll(): Promise<BannerResponseDto[]> {
    const banners = await this.repository.find({
      relations: this.relations,
      order: { orden: 'ASC', created_at: 'ASC' },
    });
    return banners.map(mapBanner);
  }

  async findOne(id: string): Promise<BannerResponseDto> {
    return mapBanner(await this.findEntity(id));
  }

  update(id: string, dto: UpdateBannerDto): Promise<BannerResponseDto> {
    validatePatch(dto, [
      'congreso_id',
      'archivo_multimedia_id',
      'activo',
      'orden',
    ]);
    if (dto.archivo_multimedia_id === null) {
      throw new BadRequestException('La imagen del banner es obligatoria');
    }
    return this.locks.withLock(`banner:${id}`, () =>
      this.updateLocked(id, dto),
    );
  }

  remove(id: string): Promise<string> {
    return this.locks.withLock(`banner:${id}`, () => this.removeLocked(id));
  }

  private async updateLocked(
    id: string,
    dto: UpdateBannerDto,
  ): Promise<BannerResponseDto> {
    const banner = await this.findEntity(id);
    const original = this.repository.create({ ...banner });
    const { congreso_id, archivo_multimedia_id, ...data } = dto;
    const [congreso, imagen] = await Promise.all([
      congreso_id ? this.relationsService.findCongreso(congreso_id) : undefined,
      archivo_multimedia_id
        ? this.archivos.resolveBanner(archivo_multimedia_id, id)
        : undefined,
    ]);
    this.repository.merge(banner, {
      ...data,
      ...(congreso ? { congreso } : {}),
      ...(imagen ? { imagen } : {}),
    });

    try {
      await this.repository.save(banner);
    } catch (error) {
      this.dbErrors.handle(error);
    }
    await this.lifecycle.cleanupPrevious(
      banner.imagen,
      original.imagen,
      ImagenContenidoDestino.BANNERS,
      () => this.repository.save(original).then(() => undefined),
    );
    return mapBanner(banner);
  }

  private async removeLocked(id: string): Promise<string> {
    const banner = await this.findEntity(id);
    const original = this.repository.create({ ...banner });

    try {
      await this.dataSource.transaction(async (manager) => {
        banner.imagen = null;
        await manager.save(Banner, banner);
        await manager.softDelete(Banner, id);
      });
    } catch (error) {
      this.dbErrors.handle(error);
    }

    await this.lifecycle.cleanupPrevious(
      null,
      original.imagen,
      ImagenContenidoDestino.BANNERS,
      async () => {
        await this.repository.restore(id);
        await this.repository.save(original);
      },
    );
    return 'Banner eliminado correctamente';
  }

  private async findEntity(id: string): Promise<Banner> {
    const banner = await this.repository.findOne({
      where: { id },
      relations: this.relations,
    });
    if (!banner) throw new NotFoundException('Banner no encontrado');
    return banner;
  }
}
