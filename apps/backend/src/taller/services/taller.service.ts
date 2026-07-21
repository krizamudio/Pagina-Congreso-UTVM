import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { DatabaseErrorHandlerService } from '../../common/database/handle-database-error';
import { ResourceLockService } from '../../common/resource-lock.service';
import { ValidadorCommon } from '../../common/validador.provider';
import { validatePatch } from '../../common/validation/patch.validator';
import { AgendaConflictService } from '../../gestion-contenido/agenda/agenda-conflict.service';
import { AgendaRelationsService } from '../../gestion-contenido/agenda/agenda-relations.service';
import { CreateTallerDto } from '../dto/create-taller.dto';
import { UpdateTallerDto } from '../dto/update-taller.dto';
import { Taller } from '../entities/taller.entity';
import { TallerCapacityService } from './taller-capacity.service';

type TallerConInscritos = Taller & { inscritos: number };

@Injectable()
export class TallerService {
  private readonly relations = {
    congreso: true,
    ubicacion: true,
    ponente: true,
  } as const;

  constructor(
    @InjectRepository(Taller)
    private readonly repository: Repository<Taller>,
    private readonly validator: ValidadorCommon,
    private readonly agendaRelations: AgendaRelationsService,
    private readonly conflicts: AgendaConflictService,
    private readonly locks: ResourceLockService,
    private readonly dbErrors: DatabaseErrorHandlerService,
    private readonly dataSource: DataSource,
    private readonly capacity: TallerCapacityService,
  ) {}

  createTaller(dto: CreateTallerDto): Promise<Taller> {
    return this.locks.withLock(`agenda:${dto.fecha}:${dto.ubicacion_id}`, () =>
      this.dataSource.transaction((manager) => this.createLocked(dto, manager)),
    );
  }

  async findAllTalleres(): Promise<TallerConInscritos[]> {
    const talleres = await this.repository.find({
      relations: [
        'congreso',
        'ubicacion',
        'ponente',
        'ponente.foto',
        'inscripciones',
      ],
      order: {
        fecha: 'ASC',
        hora_inicio: 'ASC',
      },
    });

    return talleres.map((taller) => ({
      ...taller,
      inscritos: taller.inscripciones?.length ?? 0,
    }));
  }

  async findOneTaller(id: string): Promise<TallerConInscritos> {
    const taller = await this.repository.findOne({
      where: { id },
      relations: [
        'congreso',
        'ubicacion',
        'ponente',
        'ponente.foto',
        'inscripciones',
      ],
    });

    if (!taller) {
      throw new NotFoundException(
        `No se encontro ningun taller con el id ${id}`,
      );
    }

    return {
      ...taller,
      inscritos: taller.inscripciones?.length ?? 0,
    };
  }

  async updateTaller(id: string, dto: UpdateTallerDto): Promise<Taller> {
    validatePatch(dto, [
      'congreso_id',
      'ubicacion_id',
      'tallerista_id',
      'titulo',
      'descripcion',
      'cupo_maximo',
      'fecha',
      'hora_inicio',
      'hora_fin',
      'requisitos',
    ]);
    const current = await this.findOneTaller(id);
    const date = dto.fecha ?? this.dateValue(current.fecha);
    const locationId = dto.ubicacion_id ?? current.ubicacion?.id;
    if (!locationId) throw new NotFoundException('La ubicación no existe');
    return this.locks.withLock(`agenda:${date}:${locationId}`, () =>
      this.dataSource.transaction((manager) =>
        this.updateLocked(current.id, dto, manager),
      ),
    );
  }

  async removeTaller(id: string): Promise<string> {
    const taller = await this.findOneTaller(id);
    try {
      await this.repository.softDelete(taller.id);
      return 'Taller eliminado correctamente';
    } catch (error) {
      this.dbErrors.handle(error);
    }
  }

  private async createLocked(
    dto: CreateTallerDto,
    manager: EntityManager,
  ): Promise<Taller> {
    this.validator.FechaValida(dto.fecha);
    this.validator.ValidarHoras(dto.hora_fin, dto.hora_inicio);
    const ubicacion = await this.capacity.lockLocation(
      manager,
      dto.ubicacion_id,
    );
    const relations = await this.agendaRelations.resolve({
      congresoId: dto.congreso_id,
      ubicacionId: dto.ubicacion_id,
      ponenteId: dto.tallerista_id,
    });
    this.capacity.validateAgainstLocation(dto.cupo_maximo, ubicacion);
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
    const repository = manager.getRepository(Taller);
    const taller = repository.create({
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      cupo_maximo: dto.cupo_maximo,
      fecha: dto.fecha as unknown as Date,
      hora_inicio: dto.hora_inicio,
      hora_fin: dto.hora_fin,
      requisitos: dto.requisitos,
      ...relations,
      ubicacion,
    });
    try {
      return await repository.save(taller);
    } catch (error) {
      this.dbErrors.handle(error);
    }
  }

  private async updateLocked(
    id: string,
    dto: UpdateTallerDto,
    manager: EntityManager,
  ): Promise<Taller> {
    const repository = manager.getRepository(Taller);
    const current = await repository
      .createQueryBuilder('taller')
      .leftJoinAndSelect('taller.congreso', 'congreso')
      .leftJoinAndSelect('taller.ubicacion', 'ubicacion')
      .leftJoinAndSelect('taller.ponente', 'ponente')
      .where('taller.id = :id', { id })
      .setLock('pessimistic_write', undefined, ['taller'])
      .getOne();
    if (!current) throw new NotFoundException('Taller no encontrado');

    const fecha = dto.fecha ?? this.dateValue(current.fecha);
    const horaInicio = dto.hora_inicio ?? current.hora_inicio;
    const horaFin = dto.hora_fin ?? current.hora_fin;
    const ids = {
      congresoId: dto.congreso_id ?? current.congreso?.id,
      ubicacionId: dto.ubicacion_id ?? current.ubicacion?.id,
      ponenteId: dto.tallerista_id ?? current.ponente?.id,
    };
    if (!ids.congresoId || !ids.ubicacionId || !ids.ponenteId) {
      throw new NotFoundException('Las relaciones de la actividad no existen');
    }
    const ubicacion = await this.capacity.lockLocation(
      manager,
      ids.ubicacionId,
    );
    const cupo = dto.cupo_maximo ?? current.cupo_maximo;
    this.capacity.validateAgainstLocation(cupo, ubicacion);
    await this.capacity.validateAgainstEnrollments(manager, current.id, cupo);
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
      excludeTallerId: current.id,
    });
    repository.merge(current, {
      ...(dto.titulo !== undefined ? { titulo: dto.titulo } : {}),
      ...(dto.descripcion !== undefined
        ? { descripcion: dto.descripcion }
        : {}),
      ...(dto.cupo_maximo !== undefined
        ? { cupo_maximo: dto.cupo_maximo }
        : {}),
      ...(dto.fecha !== undefined
        ? { fecha: dto.fecha as unknown as Date }
        : {}),
      ...(dto.hora_inicio !== undefined
        ? { hora_inicio: dto.hora_inicio }
        : {}),
      ...(dto.hora_fin !== undefined ? { hora_fin: dto.hora_fin } : {}),
      ...(dto.requisitos !== undefined ? { requisitos: dto.requisitos } : {}),
      ...relations,
      ubicacion,
    });
    try {
      return await repository.save(current);
    } catch (error) {
      this.dbErrors.handle(error);
    }
  }

  private dateValue(value: Date | string): string {
    return value instanceof Date ? value.toISOString().slice(0, 10) : value;
  }
}
