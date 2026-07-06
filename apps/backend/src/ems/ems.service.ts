import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';

import { GeneradorCommon } from '../../common/generador.common';
import { Ems } from './entities/ems.entity';
import { CreateEmsDto } from './dto/create-ems.dto';
import { UpdateEmsDto } from './dto/update-ems.dto';

@Injectable()
export class EmsService {
  constructor(
    @InjectRepository(Ems)
    private readonly emsRepository: Repository<Ems>,
    private readonly generador: GeneradorCommon,
  ) {}

  async create(createEmsDto: CreateEmsDto) {
    const participante = this.emsRepository.create({
      ...createEmsDto,
      correo: createEmsDto.correo.trim().toLowerCase(),
    });

    return this.emsRepository.save(participante);
  }

  async createMany(participantes: CreateEmsDto[]) {
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

    const existentes = await this.emsRepository.find({
      where: { correo: In(correos) },
    });

    if (existentes.length > 0) {
      throw new BadRequestException({
        message: 'Algunos correos ya están registrados',
        correos: existentes.map((p) => p.correo),
      });
    }

    const registros = this.emsRepository.create(participantesNormalizados);
    return this.emsRepository.save(registros);
  }

  findAll() {
    return this.emsRepository.find();
  }

  async findOne(id: number) {
    const participante = await this.emsRepository.findOne({
      where: { id },
    });

    if (!participante) {
      throw new NotFoundException('Participante EMS no encontrado');
    }

    return participante;
  }

  async update(id: number, updateEmsDto: UpdateEmsDto) {
    const participante = await this.findOne(id);

    Object.assign(participante, updateEmsDto);

    if (updateEmsDto.correo) {
      participante.correo = updateEmsDto.correo.trim().toLowerCase();
    }

    return this.emsRepository.save(participante);
  }

  async remove(id: number) {
    const participante = await this.findOne(id);

    participante.correo_original = participante.correo_original ?? participante.correo;
    participante.correo = this.generador.CorreoEliminado();

    await this.emsRepository.save(participante);
    await this.emsRepository.softDelete(id);

    return {
      message: 'Participante EMS eliminado correctamente',
    };
  }

  async restore(id: number) {
    const participante = await this.emsRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!participante) {
      throw new NotFoundException('Participante EMS no encontrado');
    }

    const correoRestaurado = participante.correo_original ?? participante.correo;
    const correoEnUso = await this.emsRepository.findOne({
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

    await this.emsRepository.restore(id);
    participante.correo = correoRestaurado;
    participante.correo_original = null;
    participante.deleted_at = undefined;

    await this.emsRepository.save(participante);

    return {
      message: 'Participante EMS restaurado correctamente',
    };
  }
}
