import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Utvm } from './entities/utvm.entity';
import { CreateUtvmDto } from './dto/create-utvm.dto';
import { UpdateUtvmDto } from './dto/update-utvm.dto';

@Injectable()
export class UtvmService {
  constructor(
    @InjectRepository(Utvm)
    private readonly utvmRepository: Repository<Utvm>,
  ) {}

  async create(createUtvmDto: CreateUtvmDto) {
    const participante = this.utvmRepository.create(createUtvmDto);
    return this.utvmRepository.save(participante);
  }

  async createMany(participantes: CreateUtvmDto[]) {
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

    const existentes = await this.utvmRepository.find({
      where: { correo: In(correos) },
    });

    if (existentes.length > 0) {
      throw new BadRequestException({
        message: 'Algunos correos ya están registrados',
        correos: existentes.map((p) => p.correo),
      });
    }

    const registros = this.utvmRepository.create(participantes);
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

    return this.utvmRepository.save(participante);
  }

  async remove(id: number) {
    const participante = await this.findOne(id);

    await this.utvmRepository.remove(participante);

    return {
      message: 'Participante UTVM eliminado correctamente',
    };
  }
}
