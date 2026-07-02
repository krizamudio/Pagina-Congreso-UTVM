import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

function sanitizeString(value: any) {
  if (typeof value !== 'string') return value;

  let s = value.replace(/<[^>]*>/g, '').trim();
  s = s.replace(
    /(\b)(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|EXEC|UNION|--|AND|OR)(\b)/gi,
    '',
  );
  s = s.replace(
    /(--|;|\/\*|\*\/|@@|@|char\(|nchar\(|varchar\(|nvarchar\(|cast\(|convert\()/gi,
    '',
  );

  return s;
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
  @Transform(({ value }) => sanitizeString(value))
  nombre!: string;

  @IsUUID('4', {
    message: 'El campo "archivo_foto_id" debe ser un UUID válido.',
  })
  @IsNotEmpty({ message: 'El campo "archivo_foto_id" es obligatorio.' })
  archivo_foto_id!: string;

  @IsString({ message: 'El campo "institucion" debe ser texto.' })
  @IsNotEmpty({ message: 'El campo "institucion" es obligatorio.' })
  @MaxLength(200, {
    message:
      'El campo "institucion" no puede tener más de $constraint1 caracteres.',
  })
  @Transform(({ value }) => sanitizeString(value))
  institucion!: string;

  @IsString({ message: 'El campo "semblanza" debe ser texto.' })
  @IsNotEmpty({ message: 'El campo "semblanza" es obligatorio.' })
  @MaxLength(2000, {
    message: 'El campo "semblanza" no puede exceder $constraint1 caracteres.',
  })
  @Transform(({ value }) => sanitizeString(value))
  semblanza!: string;

  @IsString({ message: 'El campo "tema" debe ser texto.' })
  @IsNotEmpty({ message: 'El campo "tema" es obligatorio.' })
  @MaxLength(255, {
    message: 'El campo "tema" no puede tener más de $constraint1 caracteres.',
  })
  @Transform(({ value }) => sanitizeString(value))
  tema!: string;

  @IsBoolean({ message: 'El campo "visible_publico" debe ser booleano.' })
  @IsOptional()
  visible_publico?: boolean;
}
