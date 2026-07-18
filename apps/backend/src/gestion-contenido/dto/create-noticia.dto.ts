import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import { ContenidoEstado } from '../enums/contenido-estado.enum';
import { trimString } from './dto-transformers';

export class CreateNoticiaDto {
  @IsUUID('4', { message: 'El campo "congreso_id" debe ser un UUID válido.' })
  congreso_id!: string;

  @Transform(({ value }) => trimString(value))
  @IsString({ message: 'El campo "titulo" debe ser texto.' })
  @IsNotEmpty({ message: 'El campo "titulo" es obligatorio.' })
  @MaxLength(200)
  titulo!: string;

  @Transform(({ value }) => trimString(value))
  @IsString({ message: 'El campo "cuerpo" debe ser texto.' })
  @IsNotEmpty({ message: 'El campo "cuerpo" es obligatorio.' })
  @MaxLength(50000)
  cuerpo!: string;

  @IsUUID('4', {
    message: 'El campo "archivo_portada_id" debe ser un UUID válido.',
  })
  @IsOptional()
  archivo_portada_id?: string | null;

  @IsEnum(ContenidoEstado, {
    message: 'El estado debe ser "borrador" o "publicado".',
  })
  @IsOptional()
  estado?: ContenidoEstado;
}
