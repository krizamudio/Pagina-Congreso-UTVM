import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DatabaseErrorHandlerService } from '../../common/database/handle-database-error';
import { validatePatch } from '../../common/validation/patch.validator';
import { CreateSeccionContenidoDto } from '../dto/create-seccion-contenido.dto';
import { SeccionContenidoResponseDto } from '../dto/seccion-contenido-response.dto';
import { UpdateSeccionContenidoDto } from '../dto/update-seccion-contenido.dto';
import { SeccionContenido } from '../entities/seccion-contenido.entity';
import { ContenidoEstado } from '../enums/contenido-estado.enum';
import { mapSeccion } from '../mappers/contenido.mapper';
import { ContenidoRelationsService } from './contenido-relations.service';

@Injectable()
export class SeccionContenidoService {
  private readonly relations = { congreso: true } as const;

  constructor(
    @InjectRepository(SeccionContenido)
    private readonly repository: Repository<SeccionContenido>,
    private readonly relationsService: ContenidoRelationsService,
    private readonly dbErrors: DatabaseErrorHandlerService,
  ) {}

  async create(
    dto: CreateSeccionContenidoDto,
  ): Promise<SeccionContenidoResponseDto> {
    const { congreso_id, ...data } = dto;
    const congreso = await this.relationsService.findCongreso(congreso_id);
    const seccion = this.repository.create({
      ...data,
      cuerpo: data.cuerpo ?? null,
      estado: data.estado ?? ContenidoEstado.BORRADOR,
      congreso,
    });

    try {
      return mapSeccion(await this.repository.save(seccion));
    } catch (error) {
      this.dbErrors.handle(error);
    }
  }

  async findAll(): Promise<SeccionContenidoResponseDto[]> {
    const secciones = await this.repository.find({
      relations: this.relations,
      order: { clave_seccion: 'ASC' },
    });
    return secciones.map(mapSeccion);
  }

  async findOne(id: string): Promise<SeccionContenidoResponseDto> {
    return mapSeccion(await this.findEntity(id));
  }

  async update(
    id: string,
    dto: UpdateSeccionContenidoDto,
  ): Promise<SeccionContenidoResponseDto> {
    validatePatch(dto, ['congreso_id', 'clave_seccion', 'titulo', 'estado']);
    const seccion = await this.findEntity(id);
    const { congreso_id, ...data } = dto;
    const congreso = congreso_id
      ? await this.relationsService.findCongreso(congreso_id)
      : undefined;
    this.repository.merge(seccion, {
      ...data,
      ...(congreso ? { congreso } : {}),
    });

    try {
      return mapSeccion(await this.repository.save(seccion));
    } catch (error) {
      this.dbErrors.handle(error);
    }
  }

  async remove(id: string): Promise<string> {
    await this.findEntity(id);
    try {
      const result = await this.repository.softDelete(id);
      if (result.affected !== 1) {
        throw new NotFoundException('Sección de contenido no encontrada');
      }
      return 'Sección de contenido eliminada correctamente';
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.dbErrors.handle(error);
    }
  }

  private async findEntity(id: string): Promise<SeccionContenido> {
    const seccion = await this.repository.findOne({
      where: { id },
      relations: this.relations,
    });
    if (!seccion) {
      throw new NotFoundException('Sección de contenido no encontrada');
    }
    return seccion;
  }
}
