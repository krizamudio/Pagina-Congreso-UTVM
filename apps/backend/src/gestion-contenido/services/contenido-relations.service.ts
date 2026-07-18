import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Congreso } from '../../congreso/entities/congreso.entity';

@Injectable()
export class ContenidoRelationsService {
  constructor(
    @InjectRepository(Congreso)
    private readonly congresos: Repository<Congreso>,
  ) {}

  async findCongreso(id: string): Promise<Congreso> {
    const congreso = await this.congresos.findOneBy({ id });
    if (!congreso) {
      throw new NotFoundException('El congreso indicado no existe');
    }
    return congreso;
  }
}
