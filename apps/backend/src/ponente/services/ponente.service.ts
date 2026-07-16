import {
  BadRequestException,
  Injectable,
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
import { ResourceLockService } from '../../common/resource-lock.service';
import { DatabaseErrorHandlerService } from '../../common/database/handle-database-error';

//TODO: Falta hacer pruebas en esta parte, (Cuando este el front)

@Injectable()
export class PonenteService {
  constructor(
    @InjectRepository(Ponente)
    private readonly ponenteRepository: Repository<Ponente>,
    private readonly photoService: PonentePhotoService,
    private readonly locks: ResourceLockService,
    private readonly dbErrors: DatabaseErrorHandlerService,
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
      this.dbErrors.handle(error);
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

    return this.locks.withLock(`ponente:${id}`, () =>
      this.updateLocked(id, updatePonenteDto),
    );
  }

  async removePonente(id: string): Promise<string> {
    return this.locks.withLock(`ponente:${id}`, () => this.removeLocked(id));
  }

  private async updateLocked(
    id: string,
    updatePonenteDto: UpdatePonenteDto,
  ): Promise<string> {
    const ponente = await this.ponenteRepository.findOne({
      where: { id },
      relations: { foto: true },
    });
    this.ensurePonenteExists(ponente, id);
    const original = this.ponenteRepository.create({ ...ponente });

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
    } catch (error) {
      this.dbErrors.handle(error);
    }

    await this.photoService.cleanupPrevious(
      ponente.foto,
      original.foto,
      async () => {
        await this.ponenteRepository.save(original);
      },
    );

    return 'Ponente actualizado correctamente';
  }

  private async removeLocked(id: string): Promise<string> {
    const ponente = await this.ponenteRepository.findOne({
      where: { id },
      relations: { foto: true },
    });
    this.ensurePonenteExists(ponente, id);

    let affected: number | null | undefined;

    try {
      ({ affected } = await this.ponenteRepository.softDelete(id));
    } catch (error) {
      this.dbErrors.handle(error);
    }

    if (affected === 0) {
      throw new NotFoundException('No se encontro ningun registro');
    }

    if (ponente.foto) {
      await this.photoService.cleanupPrevious(null, ponente.foto, async () => {
        await this.ponenteRepository.restore(id);
        await this.ponenteRepository.save(ponente);
      });
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
}
