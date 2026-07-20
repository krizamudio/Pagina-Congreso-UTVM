import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { ValidadorCommon } from '../../common/validador.provider';
import { Ponente } from '../../ponente/entities/ponente.entity';

type TallerConInscritos = Taller & {
  inscritos: number;
};

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
  ) {}

  async createTaller(
    createTallerDto: CreateTallerDto,
  ): Promise<TallerConInscritos> {
    const {
      tallerista_id,
      congreso_id,
      ubicacion_id,
      fecha,
      hora_fin,
      hora_inicio,
      ...datosTaller
    } = createTallerDto;

    this.validador.FechaValida(fecha);
    this.validador.ValidarHoras(hora_fin, hora_inicio);

    const tallerCreado = this.tallerRepository.create({
      ...datosTaller,
      fecha,
      hora_fin,
      hora_inicio,

      ...(tallerista_id
        ? {
            ponente: {
              id: tallerista_id,
            } as Ponente,
          }
        : {}),
    } as DeepPartial<Taller>);

    try {
      const tallerGuardado = await this.tallerRepository.save(tallerCreado);
      return await this.findOneTaller(tallerGuardado.id);
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async findAllTalleres(): Promise<TallerConInscritos[]> {
    const talleres = await this.tallerRepository.find({
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
    const taller = await this.tallerRepository.findOne({
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

  async updateTaller(
    id: string,
    updateTallerDto: UpdateTallerDto,
  ): Promise<TallerConInscritos> {
    const {
      tallerista_id,
      congreso_id,
      ubicacion_id,
      fecha,
      hora_fin,
      hora_inicio,
      ...datosTaller
    } = updateTallerDto;

    const tallerActual = await this.findOneTaller(id);

    this.validador.FechaValida(fecha);

    this.validador.ValidarHorasActualizacion(
      tallerActual.hora_fin,
      tallerActual.hora_inicio,
      hora_fin,
      hora_inicio,
    );
  }

    const taller = await this.tallerRepository.preload({
      id,
      ...datosTaller,
      ...(fecha ? { fecha } : {}),
      ...(hora_inicio ? { hora_inicio } : {}),
      ...(hora_fin ? { hora_fin } : {}),
      ...(tallerista_id
        ? {
            ponente: {
              id: tallerista_id,
            } as Ponente,
          }
        : {}),
    } as DeepPartial<Taller>);

    if (!taller) {
      throw new NotFoundException(
        `No se encontro ningun taller con el id ${id}`,
      );
    }
  }

  async restoreTaller(id: string): Promise<Taller> {
    try {
      const tallerActualizado = await this.tallerRepository.save(taller);
      return await this.findOneTaller(tallerActualizado.id);
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async removeTaller(id: string): Promise<TallerConInscritos> {
    const taller = await this.findOneTaller(id);

    try {
      return await this.repository.save(taller);
    } catch (error) {
      this.dbErrors.handle(error);
    }
  }

  async restoreTaller(id: string): Promise<TallerConInscritos> {
    try {
      await this.tallerRepository.restore(id);
      return await this.findOneTaller(id);
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  private dateValue(value: Date | string): string {
    return value instanceof Date ? value.toISOString().slice(0, 10) : value;
  }
}
