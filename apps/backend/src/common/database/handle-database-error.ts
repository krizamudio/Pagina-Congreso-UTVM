import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import type { PostgresError } from './types/postres-error.type';


@Injectable()
export class DatabaseErrorHandlerService{

handle(error: unknown): never {
  if (error instanceof QueryFailedError) {
    const dbError = error.driverError as PostgresError;

    switch (dbError.code) {
      case '23505':
        throw new ConflictException('Ya existe un registro con esos datos');

      case '23503':
        throw new BadRequestException('Una relación enviada no existe');

      case '23502':
        throw new BadRequestException('Falta un campo obligatorio');

      case '23514':
        throw new BadRequestException(
          'Algún valor no cumple las reglas de la base de datos',
        );

      default:
        throw new InternalServerErrorException(
          'Error al guardar en la base de datos',
        );
    }
  }

  throw new InternalServerErrorException('Error inesperado del servidor');
}

}