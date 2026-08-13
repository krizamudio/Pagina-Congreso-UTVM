import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { PonenteTipo } from '../enums/ponente-tipo.enum';

function trimString(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class CreatePonenteDto {
  @IsUUID('4', { message: 'El campo "usuario_id" debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'El campo "usuario_id" es obligatorio.' })
  usuario_id!: string;

  @IsString({ message: 'El campo "nombre" debe ser texto.' })
  @IsNotEmpty({ message: 'El campo "nombre" es obligatorio.' })
  @MaxLength(200, {
    message: 'El campo "nombre" no puede tener más de $constraint1 caracteres.',
  })
  @Transform(({ value }) => trimString(value))
  nombre!: string;

  @IsUUID('4', {
    message: 'El campo "archivo_foto_id" debe ser un UUID válido.',
  })
  @IsOptional()
  archivo_foto_id?: string | null;

  @IsString({ message: 'El campo "institucion" debe ser texto.' })
  @IsNotEmpty({ message: 'El campo "institucion" es obligatorio.' })
  @MaxLength(200, {
    message:
      'El campo "institucion" no puede tener más de $constraint1 caracteres.',
  })
  @Transform(({ value }) => trimString(value))
  institucion!: string;

  @IsEnum(PonenteTipo, {
    message: 'El tipo debe ser Ponente, Panelista o Evaluador',
  })
  tipo!: PonenteTipo;

  @IsString({ message: 'El campo "semblanza" debe ser texto.' })
  @IsNotEmpty({ message: 'El campo "semblanza" es obligatorio.' })
  @MaxLength(2000, {
    message: 'El campo "semblanza" no puede exceder $constraint1 caracteres.',
  })
  @Transform(({ value }) => trimString(value))
  semblanza!: string;

  @IsString({ message: 'El campo "tema" debe ser texto.' })
  @IsNotEmpty({ message: 'El campo "tema" es obligatorio.' })
  @MaxLength(255, {
    message: 'El campo "tema" no puede tener más de $constraint1 caracteres.',
  })
  @Transform(({ value }) => trimString(value))
  tema!: string;

  @IsBoolean({ message: 'El campo "visible_publico" debe ser booleano.' })
  @IsOptional()
  visible_publico?: boolean;
}
