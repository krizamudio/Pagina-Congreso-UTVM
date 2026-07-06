import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';

import { GeneradorCommon } from '../../common/generador.common';
import { Utvm } from './entities/utvm.entity';
import { CreateUtvmDto } from './dto/create-utvm.dto';
import { UpdateUtvmDto } from './dto/update-utvm.dto';

@Injectable()
export class UtvmService {
  constructor(
    @InjectRepository(Utvm)
    private readonly utvmRepository: Repository<Utvm>,
    private readonly generador: GeneradorCommon,
  ) {}

  async create(createUtvmDto: CreateUtvmDto) {
    const participante = this.utvmRepository.create({
      ...createUtvmDto,
      correo: createUtvmDto.correo.trim().toLowerCase(),
    });

    return this.utvmRepository.save(participante);
  }

  async createMany(participantes: CreateUtvmDto[]) {
    if (!participantes || participantes.length === 0) {
      throw new BadRequestException('La lista de participantes está vacía');
    }

    const participantesNormalizados = participantes.map((participante) => {
      return {
        ...participante,
        correo: participante.correo.trim().toLowerCase(),
      };
    });

    const correos = participantesNormalizados.map((p) => p.correo);

    const correosRepetidos = correos.filter(
      (correo, index) => correos.indexOf(correo) !== index,
    );

    if (correosRepetidos.length > 0) {
      throw new BadRequestException({
        message: 'Hay correos repetidos en la lista',
        correos: correosRepetidos,
      });
    }

    const existentes = await this.utvmRepository.find({
      where: { correo: In(correos) },
    });

    if (existentes.length > 0) {
      throw new BadRequestException({
        message: 'Algunos correos ya están registrados',
        correos: existentes.map((p) => p.correo),
      });
    }

    const registros = this.utvmRepository.create(participantesNormalizados);
    return this.utvmRepository.save(registros);
  }

  findAll() {
    return this.utvmRepository.find();
  }

  async findOne(id: number) {
    const participante = await this.utvmRepository.findOne({
      where: { id },
    });

    if (!participante) {
      throw new NotFoundException('Participante UTVM no encontrado');
    }

    return participante;
  }

  async update(id: number, updateUtvmDto: UpdateUtvmDto) {
    const participante = await this.findOne(id);

    Object.assign(participante, updateUtvmDto);

    if (updateUtvmDto.correo) {
      participante.correo = updateUtvmDto.correo.trim().toLowerCase();
    }

    return this.utvmRepository.save(participante);
  }

  async remove(id: number) {
    const participante = await this.findOne(id);

    participante.correo_original = participante.correo_original ?? participante.correo;
    participante.correo = this.generador.CorreoEliminado();

    await this.utvmRepository.save(participante);
    await this.utvmRepository.softDelete(id);

    return {
      message: 'Participante UTVM eliminado correctamente',
    };
  }

  async restore(id: number) {
    const participante = await this.utvmRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!participante) {
      throw new NotFoundException('Participante UTVM no encontrado');
    }

    const correoRestaurado = participante.correo_original ?? participante.correo;
    const correoEnUso = await this.utvmRepository.findOne({
      where: {
        id: Not(id),
        correo: correoRestaurado,
        deleted_at: IsNull(),
      },
    });

    if (correoEnUso) {
      throw new ConflictException(
        `No se puede restaurar el participante porque el correo ${correoRestaurado} ya está en uso.`,
      );
    }

    await this.utvmRepository.restore(id);
    participante.correo = correoRestaurado;
    participante.correo_original = null;
    participante.deleted_at = undefined;

    await this.utvmRepository.save(participante);

    return {
      message: 'Participante UTVM restaurado correctamente',
    };
  }
}
