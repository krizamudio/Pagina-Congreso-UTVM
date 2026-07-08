import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCongresoDto } from './dto/create-congreso.dto';
import { UpdateCongresoDto } from './dto/update-congreso.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Congreso } from './entities/congreso.entity';
import { Repository } from 'typeorm';
import { CongresoFindOneResponseDto } from './dto/congreso-find-one.dto';
import { CongresoMapper } from './mappers/congreso.mapper';

@Injectable()
export class CongresoService {

  constructor(
    @InjectRepository(Congreso)
    private readonly congresoRepository: Repository<Congreso>,
  ){}

  create(createCongresoDto: CreateCongresoDto) {
    //TODO: Hacer bien esta parte
    const congreso = this.congresoRepository.create(createCongresoDto);
    this.congresoRepository.save(congreso);

  }

  findAll() {
    return `This action returns all congreso`;
  }

  async findOne(id: string): Promise<CongresoFindOneResponseDto> {
    const congreso:  Congreso| null = await this.congresoRepository.findOneBy({
      id
    });

    if( !congreso ){
      throw new NotFoundException(`No se encontro ningun congreso con el id ${id}`);
    }

    return CongresoMapper.toFindOneReponse(congreso);
  }

  update(id: number, updateCongresoDto: UpdateCongresoDto) {
    return `This action updates a #${id} congreso`;
  }

  remove(id: number) {
    return `This action removes a #${id} congreso`;
  }
}
