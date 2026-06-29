import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Externo } from './entities/externo.entity';
import { CreateExternoDto } from './dto/create-externo.dto';
import { UpdateExternoDto } from './dto/update-externo.dto';

@Injectable()
export class ExternosService {

  constructor(
    @InjectRepository(Externo)
    private readonly externoRepository: Repository<Externo>,
  ) {}

  async create(createExternoDto: CreateExternoDto) {

    const externo = this.externoRepository.create(createExternoDto);

    return await this.externoRepository.save(externo);

  }

  async findAll() {

    return await this.externoRepository.find();

  }

  async findOne(id: string) {

    const externo = await this.externoRepository.findOne({
      where: { id },
    });

    if (!externo) {
      throw new NotFoundException('Externo no encontrado');
    }

    return externo;

  }

  async update(
    id: string,
    updateExternoDto: UpdateExternoDto,
  ) {

    const externo = await this.findOne(id);

    Object.assign(externo, updateExternoDto);

    return await this.externoRepository.save(externo);

  }

  async remove(id: string) {

    const externo = await this.findOne(id);

    return await this.externoRepository.remove(externo);

  }

}