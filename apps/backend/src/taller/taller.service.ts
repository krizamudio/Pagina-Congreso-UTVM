import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTallerDto } from './dto/create-taller.dto';
import { UpdateTallerDto } from './dto/update-taller.dto';
import { Taller } from './entities/taller.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TallerService {
  constructor(
    @InjectRepository(Taller)
    private readonly tallerRepository: Repository<Taller>,
  ) {}

  async createTaller(createTallerDto: CreateTallerDto): Promise<Taller> {
    const { fecha, hora_fin, hora_inicio } = createTallerDto;

    const fechaFormateada = new Date(fecha);
    const diaActual = new Date();

    if (fechaFormateada.getTime() <= diaActual.getTime()) {
      throw new BadRequestException(
        'La fecha no puede ser anterior ni igual al dia actual',
      );
    }

    if (hora_fin <= hora_inicio) {
      throw new BadRequestException(
        'La hora de fin no puede ser igual ni menor a la hora de inicio',
      );
    }

    const tallerCreado = this.tallerRepository.create(createTallerDto);

    try {
      await this.tallerRepository.save(tallerCreado);
      return tallerCreado;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async findAllTalleres(): Promise<Taller[]> {
    const talleres: Taller[] = await this.tallerRepository.find();

    return talleres;
  }

  async findOneTaller(id: string): Promise<Taller> {
    const taller: Taller | null = await this.tallerRepository.findOneBy({ id });

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
    const { fecha, hora_fin, hora_inicio } = updateTallerDto;

    const { hora_fin: hora_fin_actual, hora_inicio: hora_inicio_actual } =
      await this.findOneTaller(id);

    if (fecha) {
      const fechaFormateada = new Date(fecha);
      const diaActual = new Date();

      if (fechaFormateada.getTime() <= diaActual.getTime()) {
        throw new BadRequestException(
          'La fecha no puede ser anterior ni igual al dia actual',
        );
      }
    }

    if (hora_inicio && hora_fin) {
      if (hora_fin >= hora_inicio) {
        throw new BadRequestException(
          'La hora de finalizacion no puede ser antes que la hora de inicio',
        );
      }
    } else {
      if (hora_fin) {
        if (hora_fin <= hora_inicio_actual) {
          throw new BadRequestException(
            'La hora de finalizacion no puede ser antes que la hora de inicio',
          );
        }
      }

      if (hora_inicio) {
        if (hora_inicio <= hora_fin_actual) {
          throw new BadRequestException(
            'La hora de inicio no puede ser despues o igual a la hora de finalizacion',
          );
        }
      }
    }

    const taller: Taller | undefined = await this.tallerRepository.preload({
      id,
      ...updateTallerDto,
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

  async removeConferencia(id: string): Promise<Taller> {
    const taller: Taller = await this.findOneTaller(id);

    try {
      await this.tallerRepository.delete(id);
      return taller;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
}
