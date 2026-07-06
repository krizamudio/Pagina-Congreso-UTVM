import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Ems } from './entities/ems.entity';
import { CreateEmsDto } from './dto/create-ems.dto';
import { UpdateEmsDto } from './dto/update-ems.dto';

@Injectable()
export class EmsService {
  constructor(
    @InjectRepository(Ems)
    private readonly emsRepository: Repository<Ems>,
  ) {}

  async create(createEmsDto: CreateEmsDto) {
    const participante = this.emsRepository.create(createEmsDto);
    return this.emsRepository.save(participante);
  }

  async createMany(participantes: CreateEmsDto[]) {
    if (!participantes || participantes.length === 0) {
      throw new BadRequestException('La lista de participantes está vacía');
    }

    const correos = participantes.map((p) => p.correo);

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

    const registros = this.emsRepository.create(participantes);
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

    return this.emsRepository.save(participante);
  }

  async remove(id: number) {
    const participante = await this.findOne(id);

    await this.emsRepository.remove(participante);

    return {
      message: 'Participante EMS eliminado correctamente',
    };
  }
}
