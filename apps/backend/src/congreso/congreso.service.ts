import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCongresoDto } from './dto/create-congreso.dto';
import { UpdateCongresoDto } from './dto/update-congreso.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Congreso } from './entities/congreso.entity';
import { Repository } from 'typeorm';
import { CongresoFindOneResponseDto } from './dto/congreso-find-one.dto';
import { CongresoMapper } from './mappers/congreso.mapper';
import { ValidadorCommon } from '../common/validador.provider';
import { DatabaseErrorHandlerService } from '../common/database/handle-database-error';

@Injectable()
export class CongresoService {
  constructor(
    @InjectRepository(Congreso)
    private readonly congresoRepository: Repository<Congreso>,
    private readonly validator: ValidadorCommon,
    private readonly databaseError: DatabaseErrorHandlerService,
  ) {}

  async create(createCongresoDto: CreateCongresoDto): Promise<string> {
    const { fecha_inicio, fecha_fin, nombre } = createCongresoDto;
    this.validator.ValidarRangoFechas(fecha_inicio, fecha_fin);

    const congresosExistentes = await this.congresoRepository.find();
    this.validator.ValidarSolapamientoFechas(
      fecha_inicio,
      fecha_fin,
      congresosExistentes,
    );

    const congreso = this.congresoRepository.create(createCongresoDto);

    try {
      await this.congresoRepository.save(congreso);
      return `Congreso -> ${nombre} creado correctamente`;
    } catch (err) {
      this.databaseError.handle(err);
    }
  }

  async findAll(): Promise<CongresoFindOneResponseDto[]> {
    const congresos: Congreso[] = await this.congresoRepository.find();

    return CongresoMapper.toFindAllResponse(congresos);
  }

  async findOne(id: string): Promise<CongresoFindOneResponseDto> {
    const congreso: Congreso | null = await this.congresoRepository.findOneBy({
      id,
    });

    if (!congreso) {
      throw new NotFoundException(
        `No se encontro ningun congreso con el id ${id}`,
      );
    }

    return CongresoMapper.toFindOneReponse(congreso);
  }

  async update(id: string, updateCongresoDto: UpdateCongresoDto) {
    const { fecha_inicio, fecha_fin } = updateCongresoDto;
    const { fechaInicio,fechaFin } =
      await this.findOne(id);
    this.validator.ValidarFechasActualizacion(
      fechaInicio.toISOString(),
      fechaFin.toISOString(),
      fecha_inicio,
      fecha_fin,
    );

    const todosLosCongresos = await this.congresoRepository.find();
    const otrosCongresos = todosLosCongresos.filter((c) => c.id !== id);
    this.validator.ValidarSolapamientoFechasActualizacion(
      fechaInicio,
      fechaFin,
      fecha_inicio,
      fecha_fin,
      otrosCongresos,
    );

    const congreso: Congreso | undefined =
      await this.congresoRepository.preload({
        id,
        ...updateCongresoDto,
      });

    if (congreso === undefined) {
      throw new NotFoundException(`El congreso con ID ${id} no fue encontrado`);
    }

    try {
      await this.congresoRepository.save(congreso);
      return `El congreso: ${congreso.nombre}, se actualizo correctamente`;
    } catch (err) {
      this.databaseError.handle(err);
    }
  }

  async remove(id: string) {
    //Se usa para saber si existe o no el congreso con ese ID
    const { nombre } = await this.findOne(id);

    try {
      await this.congresoRepository.softDelete(id);
      return `Congreso: ${nombre} eliminado correctamente`;
    } catch (err) {
      this.databaseError.handle(err);
    }
  }

  //TODO: Implementar maybe el restore
}
