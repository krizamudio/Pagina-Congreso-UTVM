import { Injectable } from '@nestjs/common';
import { CreateArchivoMultimediaDto } from './dto/create-archivo_multimedia.dto';
import { UpdateArchivoMultimediaDto } from './dto/update-archivo_multimedia.dto';
import { Multer } from 'multer';
import { generacionDeNombresAleatorios } from '../../common/generacion-nombres.common';

@Injectable()
export class ArchivoMultimediaService {

async uploadPhoto( foto: Express.Multer.File){

  foto.fieldname = generacionDeNombresAleatorios();
  
}

  create(createArchivoMultimediaDto: CreateArchivoMultimediaDto) {
    return 'This action adds a new archivoMultimedia';
  }

  findAll() {
    return `This action returns all archivoMultimedia`;
  }

  findOne(id: number) {
    return `This action returns a #${id} archivoMultimedia`;
  }

  update(id: number, updateArchivoMultimediaDto: UpdateArchivoMultimediaDto) {
    return `This action updates a #${id} archivoMultimedia`;
  }

  remove(id: number) {
    return `This action removes a #${id} archivoMultimedia`;
  }
}
