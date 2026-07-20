import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DatabaseErrorHandlerService } from '../common/database/handle-database-error';
import { ResourceLockService } from '../common/resource-lock.service';
import { ValidadorCommon } from '../common/validador.provider';
import { validatePatch } from '../common/validation/patch.validator';
import { AgendaConflictService } from '../gestion-contenido/agenda/agenda-conflict.service';
import { AgendaRelationsService } from '../gestion-contenido/agenda/agenda-relations.service';
import { CreateConferenciaDto } from './dto/create-conferencia.dto';
import { UpdateConferenciaDto } from './dto/update-conferencia.dto';
import { Conferencia } from './entities/conferencia.entity';
import {
  relacionesConferencia,
  seleccionConferencia,
} from './mappers/conferencia-query-options.mapper';

@Injectable()
export class ConferenciasService {
  constructor(
    @InjectRepository(Conferencia)
    private readonly repository: Repository<Conferencia>,
    private readonly validator: ValidadorCommon,
    private readonly agendaRelations: AgendaRelationsService,
    private readonly conflicts: AgendaConflictService,
    private readonly locks: ResourceLockService,
    private readonly dbErrors: DatabaseErrorHandlerService,
  ) {}

  create(dto: CreateConferenciaDto): Promise<Conferencia> {
    return this.locks.withLock(`agenda:${dto.fecha}:${dto.ubicacion_id}`, () =>
      this.createLocked(dto),
    );
  }

  findAllConferencias(): Promise<Conferencia[]> {
    return this.repository.find({
      relations: relacionesConferencia,
      select: seleccionConferencia,
    });
  }

  async findOneConferencia(id: string): Promise<Conferencia> {
    const conferencia = await this.repository.findOne({
      where: { id },
      relations: relacionesConferencia,
      select: seleccionConferencia,
    });
    if (!conferencia) throw new NotFoundException('Conferencia no encontrada');
    return conferencia;
  }

  async update(id: string, dto: UpdateConferenciaDto): Promise<Conferencia> {
    validatePatch(dto, [
      'congreso_id',
      'ubicacion_id',
      'ponente_id',
      'titulo',
      'resumen',
      'fecha',
      'hora_inicio',
      'hora_fin',
    ]);
    const current = await this.findOneConferencia(id);
    const fecha = dto.fecha ?? this.dateValue(current.fecha);
    const locationId = dto.ubicacion_id ?? current.ubicacion?.id;
    if (!locationId) throw new NotFoundException('La ubicación no existe');
    return this.locks.withLock(`agenda:${fecha}:${locationId}`, () =>
      this.updateLocked(current, dto),
    );
  }

  async remove(id: string): Promise<Conferencia> {
    const conferencia = await this.findOneConferencia(id);
    try {
      await this.repository.softDelete(id);
      return conferencia;
    } catch (error) {
      this.dbErrors.handle(error);
    }
  }

  async restore(id: string): Promise<Conferencia> {
    try {
      await this.repository.restore(id);
      return await this.findOneConferencia(id);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.dbErrors.handle(error);
    }
  }

  private async createLocked(dto: CreateConferenciaDto): Promise<Conferencia> {
    this.validator.FechaValida(dto.fecha);
    this.validator.ValidarHoras(dto.hora_fin, dto.hora_inicio);
    const relations = await this.agendaRelations.resolve({
      congresoId: dto.congreso_id,
      ubicacionId: dto.ubicacion_id,
      ponenteId: dto.ponente_id,
    });
    this.agendaRelations.validateDateInsideCongress(
      dto.fecha,
      relations.congreso,
    );
    await this.conflicts.validate({
      fecha: dto.fecha,
      horaInicio: dto.hora_inicio,
      horaFin: dto.hora_fin,
      ubicacionId: dto.ubicacion_id,
    });
    const conferencia = this.repository.create({
      titulo: dto.titulo,
      resumen: dto.resumen,
      fecha: dto.fecha as unknown as Date,
      hora_inicio: dto.hora_inicio,
      hora_fin: dto.hora_fin,
      ...relations,
    });
    try {
      return await this.repository.save(conferencia);
    } catch (error) {
      this.dbErrors.handle(error);
    }
  }

  private async updateLocked(
    current: Conferencia,
    dto: UpdateConferenciaDto,
  ): Promise<Conferencia> {
    const fecha = dto.fecha ?? this.dateValue(current.fecha);
    const horaInicio = dto.hora_inicio ?? current.hora_inicio;
    const horaFin = dto.hora_fin ?? current.hora_fin;
    const ids = {
      congresoId: dto.congreso_id ?? current.congreso?.id,
      ubicacionId: dto.ubicacion_id ?? current.ubicacion?.id,
      ponenteId: dto.ponente_id ?? current.ponente?.id,
    };
    if (!ids.congresoId || !ids.ubicacionId || !ids.ponenteId) {
      throw new NotFoundException('Las relaciones de la actividad no existen');
    }
    if (dto.fecha !== undefined) this.validator.FechaValida(fecha);
    this.validator.ValidarHoras(horaFin, horaInicio);
    const relations = await this.agendaRelations.resolve({
      congresoId: ids.congresoId,
      ubicacionId: ids.ubicacionId,
      ponenteId: ids.ponenteId,
    });
    this.agendaRelations.validateDateInsideCongress(fecha, relations.congreso);
    await this.conflicts.validate({
      fecha,
      horaInicio,
      horaFin,
      ubicacionId: ids.ubicacionId,
      excludeConferenciaId: current.id,
    });
    this.repository.merge(current, {
      ...(dto.titulo !== undefined ? { titulo: dto.titulo } : {}),
      ...(dto.resumen !== undefined ? { resumen: dto.resumen } : {}),
      ...(dto.fecha !== undefined
        ? { fecha: dto.fecha as unknown as Date }
        : {}),
      ...(dto.hora_inicio !== undefined
        ? { hora_inicio: dto.hora_inicio }
        : {}),
      ...(dto.hora_fin !== undefined ? { hora_fin: dto.hora_fin } : {}),
      ...relations,
    });
    try {
      return await this.repository.save(current);
    } catch (error) {
      this.dbErrors.handle(error);
    }
  }

  private dateValue(value: Date | string): string {
    return value instanceof Date ? value.toISOString().slice(0, 10) : value;
  }
}
