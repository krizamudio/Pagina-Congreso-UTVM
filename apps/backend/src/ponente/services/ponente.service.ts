import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreatePonenteDto } from '../dto/create-ponente.dto';
import { UpdatePonenteDto } from '../dto/update-ponente.dto';
import { Ponente } from '../entities/ponente.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PonentePhotoService } from './ponente-photo.service';
import { mapPonenteToResponse } from '../mappers/ponente.mapper';
import { ResponsePonenteDto } from '../dto/response-ponente.dto';

@Injectable()
export class PonenteService {
  private readonly logger = new Logger(PonenteService.name);

  constructor(
    @InjectRepository(Ponente)
    private readonly ponenteRepository: Repository<Ponente>,
    private readonly photoService: PonentePhotoService,
  ) {}

  async createPonente(
    createPonenteDto: CreatePonenteDto,
  ): Promise<ResponsePonenteDto> {
    const { archivo_foto_id, ...datosPonente } = createPonenteDto;
    const foto = await this.photoService.resolve(archivo_foto_id);
    const ponente = this.ponenteRepository.create({
      ...datosPonente,
      foto,
    });

    try {
      const creado = await this.ponenteRepository.save(ponente);
      return mapPonenteToResponse(creado);
    } catch (error) {
      this.throwPersistenceError('crear el ponente', error);
    }
  }

  async findAllPonente(): Promise<ResponsePonenteDto[]> {
    const ponentes = await this.ponenteRepository.find({
      relations: { foto: true },
    });

    return ponentes.map(mapPonenteToResponse);
  }

  async findOnePonente(id: string): Promise<ResponsePonenteDto> {
    const ponente = await this.ponenteRepository.findOne({
      where: { id },
      relations: { foto: true },
    });

    this.ensurePonenteExists(ponente, id);
    return mapPonenteToResponse(ponente);
  }

  async updatePonente(
    id: string,
    updatePonenteDto: UpdatePonenteDto,
  ): Promise<string> {
    if (Object.keys(updatePonenteDto).length === 0) {
      throw new BadRequestException(
        'Debe proporcionar al menos un campo para actualizar',
      );
    }

    const ponente = await this.ponenteRepository.findOneBy({ id });
    this.ensurePonenteExists(ponente, id);

    const { archivo_foto_id, ...datosPonente } = updatePonenteDto;
    const foto =
      archivo_foto_id !== undefined
        ? await this.photoService.resolve(archivo_foto_id)
        : undefined;

    this.ponenteRepository.merge(ponente, {
      ...datosPonente,
      ...(archivo_foto_id !== undefined ? { foto } : {}),
    });

    try {
      await this.ponenteRepository.save(ponente);
      return 'Ponente actualizado correctamente';
    } catch (error) {
      this.throwPersistenceError('actualizar el ponente', error);
    }
  }

  async removePonente(id: string): Promise<string> {
    let affected: number | null | undefined;

    try {
      ({ affected } = await this.ponenteRepository.softDelete(id));
    } catch (error) {
      this.throwPersistenceError('eliminar el ponente', error);
    }

    if (affected === 0) {
      throw new NotFoundException('No se encontro ningun registro');
    }

    return 'Ponente eliminado correctamente';
  }

  private ensurePonenteExists(
    ponente: Ponente | null,
    id: string,
  ): asserts ponente is Ponente {
    if (!ponente) {
      throw new NotFoundException(
        `No se encontro ningun ponente con el id ${id}`,
      );
    }
  }

  private throwPersistenceError(operation: string, error: unknown): never {
    const trace = error instanceof Error ? error.stack : undefined;
    this.logger.error(`No se pudo ${operation}`, trace);
    throw new InternalServerErrorException('No se pudo realizar la accion');
  }
}
