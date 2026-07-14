import { Injectable } from '@nestjs/common';
import { Ubicacion } from '../entities/ubicacion.entity';
import { FindUbicacionDto } from '../dto/find-ubicacion.dto';

@Injectable()
export class UbicacionMapperService {
  findAllMap(ubicacion: Ubicacion[]): FindUbicacionDto[] {
    const ubicaciones: FindUbicacionDto[] = ubicacion.map((ubi) => {
      return {
        id: ubi.id,
        nombre: ubi.nombre,
        capacidad: ubi.capacidad,
      };
    });

    return ubicaciones;
  }

  findOneMap(ubicacion: Ubicacion): FindUbicacionDto {
    const { id, nombre, capacidad } = ubicacion;

    return {
      id,
      nombre,
      capacidad,
    };
  }
}
