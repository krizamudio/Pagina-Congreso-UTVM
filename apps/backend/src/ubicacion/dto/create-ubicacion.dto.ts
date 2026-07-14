import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
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

export class CreateUbicacionDto {
  @IsString({ message: 'El campo "nombre" debe ser texto.' })
  @IsNotEmpty({ message: 'El campo "nombre" es obligatorio.' })
  @MaxLength(150, {
    message: 'El campo "nombre" no puede tener más de $constraint1 caracteres.',
  })
  @Transform(({ value }) => sanitizeString(value))
  nombre!: string;

  @Type(() => Number)
  @IsInt({ message: 'El campo "capacidad" debe ser un número entero.' })
  @Min(1, { message: 'El campo "capacidad" debe ser mayor o igual a 1.' })
  @IsNotEmpty({ message: 'El campo "capacidad" es obligatorio.' })
  capacidad!: number;
}
