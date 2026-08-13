import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Congreso } from '../../congreso/entities/congreso.entity';
import { CreateHackatonDto } from '../dto/create-hackaton.dto';
import { FindHackatonDto } from '../dto/find-hackaton.dto';
import { UpdateHackatonDto } from '../dto/update-hackaton.dto';
import { Hackaton } from '../entities/hackaton.entity';
import { HackatonPresenterService } from './hackaton-presenter.service';

@Injectable()
export class HackatonService {
  readonly relations = {
    congreso: true,
    evaluadores: { ponente: true },
    equipos: { integrantes: { participante: true } },
  } as const;
  constructor(
    @InjectRepository(Hackaton)
    private readonly repository: Repository<Hackaton>,
    @InjectRepository(Congreso)
    private readonly congresos: Repository<Congreso>,
    private readonly presenter: HackatonPresenterService,
  ) {}

  async create(dto: CreateHackatonDto) {
    const congreso = await this.requireCongreso(dto.congreso_id);
    this.validateDates(dto.fecha_inicio, dto.fecha_fin, congreso);
    try {
      const saved = await this.repository.save(
        this.repository.create({ ...dto, congreso }),
      );
      return this.findOne(saved.id);
    } catch (error) {
      this.rethrowConflict(error);
    }
  }

  async findAll(query: FindHackatonDto) {
    const builder = this.repository
      .createQueryBuilder('h')
      .leftJoinAndSelect('h.congreso', 'congreso')
      .orderBy('h.fecha_inicio', 'DESC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit);
    if (query.congresoId) builder.andWhere('congreso.id = :congresoId', query);
    if (query.buscar)
      builder.andWhere(
        '(h.nombre ILIKE :buscar OR h.descripcion ILIKE :buscar)',
        { buscar: `%${query.buscar.trim()}%` },
      );
    const [items, total] = await builder.getManyAndCount();
    return {
      data: await Promise.all(
        items.map((item) => this.presenter.present(item)),
      ),
      total,
      page: query.page,
      limit: query.limit,
    };
  }

  async getEntity(id: string): Promise<Hackaton> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: this.relations,
    });
    if (!entity) throw new NotFoundException('Hackatón no encontrado');
    return entity;
  }

  async findOne(id: string) {
    return this.presenter.present(await this.getEntity(id));
  }

  async update(id: string, dto: UpdateHackatonDto) {
    const entity = await this.getEntity(id);
    const congreso = dto.congreso_id
      ? await this.requireCongreso(dto.congreso_id)
      : entity.congreso;
    const inicio = dto.fecha_inicio ?? entity.fecha_inicio;
    const fin = dto.fecha_fin ?? entity.fecha_fin;
    this.validateDates(inicio, fin, congreso);
    Object.assign(entity, dto, { congreso });
    try {
      await this.repository.save(entity);
      return this.findOne(id);
    } catch (error) {
      this.rethrowConflict(error);
    }
  }

  async remove(id: string): Promise<void> {
    const entity = await this.getEntity(id);
    const blocked =
      entity.equipos?.some((e) => e.reconocimientos_emitidos_at) ||
      entity.evaluadores?.some((e) => e.reconocimiento_emitido_at);
    if (blocked)
      throw new ConflictException(
        'El Hackatón tiene reconocimientos emitidos y no puede eliminarse',
      );
    await this.repository.softRemove(entity);
  }

  private async requireCongreso(id: string): Promise<Congreso> {
    const congreso = await this.congresos.findOneBy({ id });
    if (!congreso) throw new NotFoundException('Congreso no encontrado');
    return congreso;
  }
  private validateDates(inicio: string, fin: string, congreso: Congreso): void {
    if (inicio > fin)
      throw new BadRequestException(
        'La fecha inicial no puede ser posterior a la final',
      );
    if (
      inicio < this.dateOnly(congreso.fecha_inicio) ||
      fin > this.dateOnly(congreso.fecha_fin)
    )
      throw new BadRequestException(
        'El periodo del Hackatón debe estar dentro de las fechas del congreso',
      );
  }
  private dateOnly(value: Date): string {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  private rethrowConflict(error: unknown): never {
    if ((error as { code?: string }).code === '23505')
      throw new ConflictException('El congreso ya tiene un Hackatón activo');
    throw error;
  }
}
