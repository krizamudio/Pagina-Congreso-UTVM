import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTallerDto } from '../dto/create-taller.dto';
import { UpdateTallerDto } from '../dto/update-taller.dto';
import { Taller } from '../entities/taller.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { ValidadorCommon } from '../../common/validador.provider';
import { TallerRelationsService } from './taller-relations.service';

@Injectable()
export class TallerService {
  constructor(
    @InjectRepository(Taller)
    private readonly tallerRepository: Repository<Taller>,
    private readonly validador: ValidadorCommon,
    private readonly relationsService: TallerRelationsService,
  ) {}

  //TODO: La logica de aqui debe validar que si hay dos talleres en el mismo horario que no esten en la misma ubicacion
  async createTaller(createTallerDto: CreateTallerDto): Promise<Taller> {
    const { congreso_id, ubicacion_id, tallerista_id, ...tallerData } =
      createTallerDto;
    const { fecha, hora_fin, hora_inicio } = tallerData;

    this.validador.FechaValida(fecha);

    this.validador.ValidarHoras(hora_fin, hora_inicio);

    const relations = await this.relationsService.resolve({
      congreso_id,
      ubicacion_id,
      tallerista_id,
    });
    const tallerCreado = this.tallerRepository.create({
      ...tallerData,
      ...relations,
    } as DeepPartial<Taller>);

    try {
      await this.tallerRepository.save(tallerCreado);
      return tallerCreado;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async findAllTalleres(): Promise<Taller[]> {
    const talleres: Taller[] = await this.tallerRepository.find({
      relations: { congreso: true, ubicacion: true, ponente: true },
    });

    return talleres;
  }

  async findOneTaller(id: string): Promise<Taller> {
    const taller: Taller | null = await this.tallerRepository.findOne({
      where: { id },
      relations: { congreso: true, ubicacion: true, ponente: true },
    });

    if (taller === null || taller === undefined) {
      throw new NotFoundException(
        `No se encontro ningun taller con el id ${id}`,
      );
    }

    return taller;
  }

  async updateTaller(
    id: string,
    updateTallerDto: UpdateTallerDto,
  ): Promise<Taller> {
    const { congreso_id, ubicacion_id, tallerista_id, ...tallerData } =
      updateTallerDto;
    const { fecha, hora_fin, hora_inicio } = tallerData;

    const { hora_fin: hora_fin_actual, hora_inicio: hora_inicio_actual } =
      await this.findOneTaller(id);

    this.validador.FechaValida(fecha);

    this.validador.ValidarHorasActualizacion(
      hora_fin_actual,
      hora_inicio_actual,
      hora_fin,
      hora_inicio,
    );

    const relations = await this.relationsService.resolve({
      congreso_id,
      ubicacion_id,
      tallerista_id,
    });
    const taller: Taller | undefined = await this.tallerRepository.preload({
      id,
      ...tallerData,
      ...relations,
    });

    if (!taller) {
      throw new NotFoundException(
        `No se encontro ningun taller con el id ${id}`,
      );
    }

    try {
      return await this.tallerRepository.save(taller);
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async removeTaller(id: string): Promise<Taller> {
    const taller: Taller = await this.findOneTaller(id);

    try {
      await this.tallerRepository.softDelete(id);
      return taller;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async restoreTaller(id: string): Promise<Taller> {
    try {
      await this.tallerRepository.restore(id);
      const taller = await this.tallerRepository.findOneBy({ id });
      if (!taller) {
        throw new NotFoundException(
          `No se encontro ningun taller con el id ${id}`,
        );
      }
      return taller;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
}
