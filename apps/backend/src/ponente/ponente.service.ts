import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePonenteDto } from './dto/create-ponente.dto';
import { UpdatePonenteDto } from './dto/update-ponente.dto';
import { Ponente } from './entities/ponente.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PonenteService {
  //TODO: Poner Logs a todos los metodos

  constructor(
    @InjectRepository(Ponente)
    private readonly ponenteRepository: Repository<Ponente>,
  ) {}

  async createPonente(createPonenteDto: CreatePonenteDto): Promise<Ponente> {
    const ponente: Ponente = this.ponenteRepository.create(createPonenteDto);

    try {
      await this.createPonente(ponente);
      return ponente;
    } catch (err) {
      throw new InternalServerErrorException('Ocurrio algo inesperado');
    }
  }

  async findAllPonente(): Promise<Ponente[]> {
    const ponentes: Ponente[] = await this.ponenteRepository.find();

    return ponentes;
  }

  async findOnePonente(id: string): Promise<Ponente> {
    const ponente: Ponente | null = await this.ponenteRepository.findOneBy({
      id,
    });

    if (!ponente) {
      throw new NotFoundException(
        `No se encontro ningun ponente con el id ${id}`,
      );
    }
    return ponente;
  }

  async updatePonente(
    id: string,
    updatePonenteDto: UpdatePonenteDto,
  ): Promise<Ponente> {
    //Si no encuentra nos va a lanzar el error de el findOne
    await this.findOnePonente(id);

    const ponenteActualizado: Ponente | undefined =
      await this.ponenteRepository.preload({
        id,
        ...updatePonenteDto,
      });

    if (ponenteActualizado === undefined) {
      throw new InternalServerErrorException('No se pudo actualizar');
    }

    try {
      return await this.ponenteRepository.save(ponenteActualizado);
    } catch (err) {
      throw new InternalServerErrorException(
        'No se pudo completar la actulizacion',
      );
    }
  }

  async removePonente(id: string): Promise<Ponente> {
    const ponente = await this.findOnePonente(id);

    try {
      await this.ponenteRepository.remove(ponente);
      return ponente;
    } catch (err) {
      throw new InternalServerErrorException('No se pudo realizar la accion');
    }
  }
}
