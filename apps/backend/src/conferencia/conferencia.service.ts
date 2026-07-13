import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateConferenciaDto } from './dto/create-conferencia.dto';
import { UpdateConferenciaDto } from './dto/update-conferencia.dto';
import { DeepPartial, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Conferencia } from './entities/conferencia.entity';
import { ValidadorCommon } from '../../common/validador.provider';
import { ConferenciaRelacionesProvider } from './providers/conferencia-relaciones.provider';
import { separarDatosConferencia } from './mappers/conferencia-datos.mapper';
import {
  relacionesConferencia,
  seleccionConferencia,
} from './mappers/conferencia-query-options.mapper';

@Injectable()
export class ConferenciasService {
  constructor(
    @InjectRepository(Conferencia)
    private readonly conferenciaRepository: Repository<Conferencia>,
    private readonly validador: ValidadorCommon,
    private readonly relacionesProvider: ConferenciaRelacionesProvider,
  ) {}

  async create(
    createConferenciaDto: CreateConferenciaDto,
  ): Promise<Conferencia> {
    const { relacionIds, datosConferencia } = separarDatosConferencia(
      createConferenciaDto,
    );
    const { fecha, hora_fin, hora_inicio } = datosConferencia;

    this.validador.FechaValida(fecha);
    this.validador.ValidarHoras(hora_fin, hora_inicio);

    const relaciones = await this.relacionesProvider.obtenerRelaciones(
      relacionIds,
    );

    const conferencia = this.conferenciaRepository.create({
      ...datosConferencia,
      ...relaciones,
    } as DeepPartial<Conferencia>);

    try {
      const conferenciaDB = await this.conferenciaRepository.save(conferencia);
      return conferenciaDB;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findAllConferencias(): Promise<Conferencia[]> {
    return await this.conferenciaRepository.find({
      relations: relacionesConferencia,
      select: seleccionConferencia,
    });
  }

  async findOneConferencia(id: string): Promise<Conferencia> {
    const conferencia = await this.conferenciaRepository.findOne({
      where: { id },
      relations: relacionesConferencia,
      select: seleccionConferencia,
    });

    if (!conferencia) {
      throw new NotFoundException(`Conferencia con id ${id} no encontrada`);
    }

    return conferencia;
  }

  async update(
    id: string,
    updateConferenciaDto: UpdateConferenciaDto,
  ): Promise<Conferencia> {
    const { relacionIds, datosConferencia } = separarDatosConferencia(
      updateConferenciaDto,
    );
    const { fecha, hora_fin, hora_inicio } = datosConferencia;
    const conferenciaActual = await this.findOneConferencia(id);

    this.validador.FechaValida(fecha);
    this.validador.ValidarHorasActualizacion(
      conferenciaActual.hora_fin,
      conferenciaActual.hora_inicio,
      hora_fin,
      hora_inicio,
    );

    const relaciones = await this.relacionesProvider.obtenerRelaciones(
      relacionIds,
    );

    const conferencia: Conferencia | undefined =
      await this.conferenciaRepository.preload({
        id,
        ...datosConferencia,
        ...relaciones,
      } as DeepPartial<Conferencia>);

    if (!conferencia) {
      throw new NotFoundException(`Conferencia con id ${id} no encontrada`);
    }

    try {
      return this.conferenciaRepository.save(conferencia);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async remove(id: string): Promise<Conferencia> {
    const conferenciaEliminada = await this.findOneConferencia(id);
    await this.conferenciaRepository.softDelete(id);
    return conferenciaEliminada;
  }

  async restore(id: string): Promise<Conferencia> {
    const conferencia = await this.conferenciaRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!conferencia) {
      throw new NotFoundException(`Conferencia con id ${id} no encontrada`);
    }

    await this.conferenciaRepository.restore(id);
    return this.findOneConferencia(id);
  }
}
