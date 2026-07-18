import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { DatabaseErrorHandlerService } from '../../common/database/handle-database-error';
import { ResourceLockService } from '../../common/resource-lock.service';
import { CreateForoEmpresarialDto } from '../dto/create-foro-empresarial.dto';
import { ForoEmpresarialResponseDto } from '../dto/foro-empresarial-response.dto';
import { UpdateForoEmpresarialDto } from '../dto/update-foro-empresarial.dto';
import { ForoEmpresarial } from '../entities/foro-empresarial.entity';
import { ForoEmpresarialMapper } from '../mappers/foro-empresarial.mapper';
import { ForoEmpresarialLogoService } from './foro-empresarial-logo.service';
import { ForoEmpresarialRelationsService } from './foro-empresarial-relations.service';

@Injectable()
export class ForoEmpresarialService {
  private readonly relations = {
    logo: true,
    congreso: true,
    ubicacion: true,
  } as const;

  constructor(
    @InjectRepository(ForoEmpresarial)
    private readonly repository: Repository<ForoEmpresarial>,
    private readonly dataSource: DataSource,
    private readonly relationService: ForoEmpresarialRelationsService,
    private readonly logoService: ForoEmpresarialLogoService,
    private readonly mapper: ForoEmpresarialMapper,
    private readonly locks: ResourceLockService,
    private readonly dbErrors: DatabaseErrorHandlerService,
  ) {}

  async create(
    dto: CreateForoEmpresarialDto,
  ): Promise<ForoEmpresarialResponseDto> {
    const { archivo_logo_id, congreso_id, ubicacion_id, ...forumData } = dto;
    const [{ congreso, ubicacion }, logo] = await Promise.all([
      this.relationService.resolveRequired(congreso_id, ubicacion_id),
      this.logoService.resolve(archivo_logo_id),
    ]);
    const foro = this.repository.create({
      ...forumData,
      congreso,
      ubicacion,
      logo: logo ?? null,
    });

    try {
      const created = await this.repository.save(foro);
      return this.mapper.toResponse(created);
    } catch (error) {
      this.dbErrors.handle(error);
    }
  }

  async findAll(): Promise<ForoEmpresarialResponseDto[]> {
    const foros = await this.repository.find({ relations: this.relations });
    return foros.map((foro) => this.mapper.toResponse(foro));
  }

  async findOne(id: string): Promise<ForoEmpresarialResponseDto> {
    return this.mapper.toResponse(await this.findEntity(id));
  }

  update(
    id: string,
    dto: UpdateForoEmpresarialDto,
  ): Promise<ForoEmpresarialResponseDto> {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException(
        'Debe proporcionar al menos un campo para actualizar',
      );
    }
    this.ensureRequiredRelationsAreNotNull(dto);
    return this.locks.withLock(`foro-empresarial:${id}`, () =>
      this.updateLocked(id, dto),
    );
  }

  remove(id: string): Promise<string> {
    return this.locks.withLock(`foro-empresarial:${id}`, () =>
      this.removeLocked(id),
    );
  }

  private async updateLocked(
    id: string,
    dto: UpdateForoEmpresarialDto,
  ): Promise<ForoEmpresarialResponseDto> {
    const foro = await this.findEntity(id);
    const original = this.repository.create({ ...foro });
    const { archivo_logo_id, congreso_id, ubicacion_id, ...forumData } = dto;
    const [relations, logo] = await Promise.all([
      this.relationService.resolveOptional({
        congresoId: congreso_id,
        ubicacionId: ubicacion_id,
      }),
      archivo_logo_id === undefined
        ? undefined
        : this.logoService.resolve(archivo_logo_id, id),
    ]);

    this.repository.merge(foro, {
      ...forumData,
      ...(relations.congreso ? { congreso: relations.congreso } : {}),
      ...(relations.ubicacion ? { ubicacion: relations.ubicacion } : {}),
      ...(archivo_logo_id !== undefined ? { logo: logo ?? null } : {}),
    });

    try {
      await this.repository.save(foro);
    } catch (error) {
      this.dbErrors.handle(error);
    }

    await this.logoService.cleanupPrevious(foro.logo, original.logo, () =>
      this.repository.save(original).then(() => undefined),
    );
    return this.mapper.toResponse(foro);
  }

  private async removeLocked(id: string): Promise<string> {
    const foro = await this.findEntity(id);
    const original = this.repository.create({ ...foro });

    await this.dataSource.transaction(async (manager) => {
      foro.logo = null;
      await manager.save(ForoEmpresarial, foro);
      const result = await manager.softDelete(ForoEmpresarial, id);
      if (result.affected !== 1) {
        throw new NotFoundException('Foro empresarial no encontrado');
      }
    });

    await this.logoService.cleanupPrevious(null, original.logo, async () => {
      await this.repository.restore(id);
      await this.repository.save(original);
    });
    return 'Foro empresarial eliminado correctamente';
  }

  private async findEntity(id: string): Promise<ForoEmpresarial> {
    const foro = await this.repository.findOne({
      where: { id },
      relations: this.relations,
    });
    if (!foro) {
      throw new NotFoundException('Foro empresarial no encontrado');
    }
    return foro;
  }

  private ensureRequiredRelationsAreNotNull(
    dto: UpdateForoEmpresarialDto,
  ): void {
    const values = dto as UpdateForoEmpresarialDto & {
      congreso_id?: string | null;
      ubicacion_id?: string | null;
    };
    if (values.congreso_id === null || values.ubicacion_id === null) {
      throw new BadRequestException(
        'Congreso y ubicación no pueden establecerse en null',
      );
    }
  }
}
