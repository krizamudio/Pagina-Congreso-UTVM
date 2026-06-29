import {
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
    const tallerCreado = this.tallerRepository.create(createTallerDto);

    try {
      return await this.tallerRepository.save(tallerCreado);
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

  async removeTaller(id: string): Promise<Taller> {
    const taller: Taller = await this.findOneTaller(id);

    try {
      await this.tallerRepository.delete(id);
      return taller;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
}
