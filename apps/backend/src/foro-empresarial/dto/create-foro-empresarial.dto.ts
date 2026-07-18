import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

function trimString(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class CreateForoEmpresarialDto {
  @IsString({ message: 'El campo "nombre" debe ser texto.' })
  @IsNotEmpty({ message: 'El campo "nombre" es obligatorio.' })
  @MaxLength(200, {
    message: 'El campo "nombre" no puede exceder $constraint1 caracteres.',
  })
  @Transform(({ value }) => trimString(value))
  nombre!: string;

  @IsUUID('4', {
    message: 'El campo "archivo_logo_id" debe ser un UUID válido.',
  })
  @IsOptional()
  archivo_logo_id?: string | null;

  @IsString({ message: 'El campo "direccion" debe ser texto.' })
  @IsNotEmpty({ message: 'El campo "direccion" es obligatorio.' })
  @MaxLength(255, {
    message: 'El campo "direccion" no puede exceder $constraint1 caracteres.',
  })
  @Transform(({ value }) => trimString(value))
  direccion!: string;

  @IsString({ message: 'El campo "resena" debe ser texto.' })
  @IsNotEmpty({ message: 'El campo "resena" es obligatorio.' })
  @MaxLength(2000, {
    message: 'El campo "resena" no puede exceder $constraint1 caracteres.',
  })
  @Transform(({ value }) => trimString(value))
  resena!: string;

  @IsUUID('4', {
    message: 'El campo "congreso_id" debe ser un UUID válido.',
  })
  @IsNotEmpty({ message: 'El campo "congreso_id" es obligatorio.' })
  congreso_id!: string;

  @IsUUID('4', {
    message: 'El campo "ubicacion_id" debe ser un UUID válido.',
  })
  @IsNotEmpty({ message: 'El campo "ubicacion_id" es obligatorio.' })
  ubicacion_id!: string;
}
