import { Injectable } from '@nestjs/common';
import { CreateCongresoDto } from './dto/create-congreso.dto';
import { UpdateCongresoDto } from './dto/update-congreso.dto';

@Injectable()
export class CongresoService {
  create(createCongresoDto: CreateCongresoDto) {
    return 'This action adds a new congreso';
  }

  findAll() {
    return `This action returns all congreso`;
  }

  findOne(id: number) {
    return `This action returns a #${id} congreso`;
  }

  update(id: number, updateCongresoDto: UpdateCongresoDto) {
    return `This action updates a #${id} congreso`;
  }

  remove(id: number) {
    return `This action removes a #${id} congreso`;
  }
}
