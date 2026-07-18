import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUbicacionDto } from './dto/create-ubicacion.dto';
import { UpdateUbicacionDto } from './dto/update-ubicacion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Ubicacion } from './entities/ubicacion.entity';
import { Repository } from 'typeorm';
import { DatabaseErrorHandlerService } from '../common/database/handle-database-error';
import { UbicacionMapperService } from './mappers/ubicacion.mapper.service';
import { FindUbicacionDto } from './dto/find-ubicacion.dto';
import { ForoEmpresarial } from '../foro-empresarial/entities/foro-empresarial.entity';

@Injectable()
export class UbicacionService {
  constructor(
    @InjectRepository(Ubicacion)
    private readonly ubicacionRepository: Repository<Ubicacion>,
    @InjectRepository(ForoEmpresarial)
    private readonly forosRepository: Repository<ForoEmpresarial>,
    private readonly databaseError: DatabaseErrorHandlerService,
    private readonly mapper: UbicacionMapperService,
  ) {}

  async create(createUbicacionDto: CreateUbicacionDto): Promise<string> {
    const ubicacionCreada: Ubicacion =
      this.ubicacionRepository.create(createUbicacionDto);

    try {
      await this.ubicacionRepository.save(ubicacionCreada);
      return 'Ubicación registrada correctamente';
    } catch (err) {
      this.databaseError.handle(err);
    }
  }

  async findAll(): Promise<FindUbicacionDto[]> {
    const ubicaciones: Ubicacion[] = await this.ubicacionRepository.find();

    return this.mapper.findAllMap(ubicaciones);
  }

  async findOne(id: string): Promise<FindUbicacionDto> {
    const ubicacion: Ubicacion | null =
      await this.ubicacionRepository.findOneBy({ id });

    if (ubicacion === null) {
      throw new NotFoundException(
        'No se encontró ninguna ubicación con ese ID',
      );
    }

    return this.mapper.findOneMap(ubicacion);
  }

  async update(
    id: string,
    updateUbicacionDto: UpdateUbicacionDto,
  ): Promise<string> {
    const ubicacionActualizada: Ubicacion | undefined =
      await this.ubicacionRepository.preload({
        id,
        ...updateUbicacionDto,
      });

    if (ubicacionActualizada === undefined) {
      throw new NotFoundException(
        'No se encontró ninguna ubicación con ese ID',
      );
    }

    try {
      await this.ubicacionRepository.save(ubicacionActualizada);
      return 'Ubicación actualizada correctamente';
    } catch (err) {
      this.databaseError.handle(err);
    }
  }

  // TODO: Esta parte no implementa softDelete. Revisar si es necesario, ya que solo son dos campos.
  async remove(id: string): Promise<string> {
    try {
      const tieneForosActivos = await this.forosRepository.exists({
        where: { ubicacion: { id } },
      });
      if (tieneForosActivos) {
        throw new ConflictException(
          'No se puede eliminar la ubicación mientras tenga foros empresariales activos',
        );
      }

      const { affected } = await this.ubicacionRepository.delete(id);

      if (affected === 0) {
        throw new NotFoundException(
          'No se encontró ninguna ubicación con ese ID',
        );
      }

      return 'Ubicación eliminada correctamente';
    } catch (err) {
      if (
        err instanceof NotFoundException ||
        err instanceof ConflictException
      ) {
        throw err;
      }
      this.databaseError.handle(err);
    }
  }
}
