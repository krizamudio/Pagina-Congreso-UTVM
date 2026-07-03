import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateConferenciaDto } from './dto/create-conferencia.dto';
import { UpdateConferenciaDto } from './dto/update-conferencia.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Conferencia } from './entities/conferencia.entity';
import { ValidadorCommon } from '../../common/validador.common';

@Injectable()
export class ConferenciasService {
  constructor(
    @InjectRepository(Conferencia)
    private readonly conferenciaRepository: Repository<Conferencia>,
    private readonly validador: ValidadorCommon,
  ) {}

  async create(
    createConferenciaDto: CreateConferenciaDto,
  ): Promise<Conferencia> {
    const { fecha, hora_fin, hora_inicio } = createConferenciaDto;

    this.validador.FechaValida(fecha);
    this.validador.ValidarHoras(hora_fin, hora_inicio);

    const conferencia = this.conferenciaRepository.create(createConferenciaDto);

    try {
      const conferenciaDB = await this.conferenciaRepository.save(conferencia);
      return conferenciaDB;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findAllConferencias(): Promise<Conferencia[]> {
    return await this.conferenciaRepository.find();
  }

  async findOneConferencia(id: string): Promise<Conferencia | null> {
    const conferencia = await this.conferenciaRepository.findOneBy({ id });
    return conferencia;
  }

  async update(
    id: string,
    updateConferenciaDto: UpdateConferenciaDto,
  ): Promise<Conferencia | null> {
    const { fecha, hora_fin, hora_inicio } = updateConferenciaDto;
    const conferenciaActual = await this.findOneConferencia(id);

    if (!conferenciaActual) {
      throw new NotFoundException(`Conferencia con id ${id} no encontrada`);
    }

    this.validador.FechaValida(fecha);
    this.validador.ValidarHorasActualizacion(
      conferenciaActual.hora_fin,
      conferenciaActual.hora_inicio,
      hora_fin,
      hora_inicio,
    );

    const conferencia: Conferencia | undefined =
      await this.conferenciaRepository.preload({
        id,
        ...updateConferenciaDto,
      });

    if (!conferencia) {
      throw new NotFoundException(`Conferencia con id ${id} no encontrada`);
    }

    try {
      return this.conferenciaRepository.save(conferencia);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async remove(id: string): Promise<void> {
    const conferenciaEliminada = await this.findOneConferencia(id);

    if (conferenciaEliminada) {
      await this.conferenciaRepository.remove(conferenciaEliminada);
    } else {
      throw new Error(`Conferencia con id ${id} no encontrada`);
    }
  }
}
