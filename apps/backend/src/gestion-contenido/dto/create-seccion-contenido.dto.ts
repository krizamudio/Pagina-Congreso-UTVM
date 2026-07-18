import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

import { ContenidoEstado } from '../enums/contenido-estado.enum';
import { normalizeContentKey, trimString } from './dto-transformers';

export class CreateSeccionContenidoDto {
  @IsUUID('4', { message: 'El campo "congreso_id" debe ser un UUID válido.' })
  congreso_id!: string;

  @Transform(({ value }) => normalizeContentKey(value))
  @IsString({ message: 'El campo "clave_seccion" debe ser texto.' })
  @IsNotEmpty({ message: 'El campo "clave_seccion" es obligatorio.' })
  @MaxLength(100)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'La clave solo permite minúsculas, números y guiones.',
  })
  clave_seccion!: string;

  @Transform(({ value }) => trimString(value))
  @IsString({ message: 'El campo "titulo" debe ser texto.' })
  @IsNotEmpty({ message: 'El campo "titulo" es obligatorio.' })
  @MaxLength(200)
  titulo!: string;

  @Transform(({ value }) => trimString(value))
  @IsString({ message: 'El campo "cuerpo" debe ser texto.' })
  @MaxLength(50000)
  @IsOptional()
  cuerpo?: string | null;

  @IsEnum(ContenidoEstado, {
    message: 'El estado debe ser "borrador" o "publicado".',
  })
  @IsOptional()
  estado?: ContenidoEstado;
}
