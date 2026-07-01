import { Transform, Type } from 'class-transformer';
import {
  IsISO8601,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  Matches,
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

export class CreateTallerDto {
  @IsUUID('4', { message: 'El campo "congreso_id" debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'El campo "congreso_id" es obligatorio.' })
  congreso_id!: string;

  @IsString({ message: 'El campo "titulo" debe ser texto.' })
  @IsNotEmpty({ message: 'El campo "titulo" es obligatorio.' })
  @MaxLength(200, {
    message: 'El campo "titulo" no puede tener más de $constraint1 caracteres.',
  })
  @Transform(({ value }) => sanitizeString(value))
  titulo!: string;

  @IsString({ message: 'El campo "descripcion" debe ser texto.' })
  @IsNotEmpty({ message: 'El campo "descripcion" es obligatorio.' })
  @MaxLength(2000, {
    message: 'El campo "descripcion" no puede exceder $constraint1 caracteres.',
  })
  @Transform(({ value }) => sanitizeString(value))
  descripcion!: string;

  @IsUUID('4', { message: 'El campo "tallerista_id" debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'El campo "tallerista_id" es obligatorio.' })
  tallerista_id!: string;

  @Type(() => Number)
  @IsInt({ message: 'El campo "cupo_maximo" debe ser un número entero.' })
  @Min(1, { message: 'El campo "cupo_maximo" debe ser mayor o igual a 1.' })
  @IsNotEmpty({ message: 'El campo "cupo_maximo" es obligatorio.' })
  cupo_maximo!: number;

  @IsISO8601(
    { strict: true },
    { message: 'El campo "fecha" debe tener formato ISO (YYYY-MM-DD).' },
  )
  @IsNotEmpty({ message: 'El campo "fecha" es obligatorio.' })
  fecha!: string;

  // TODO: No mostrar todo el error al momento de que manden algo como 
  // 28:00:00
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/, {
    message: 'El campo "hora_inicio" debe tener formato HH:MM o HH:MM:SS.',
  })
  @IsNotEmpty({ message: 'El campo "hora_inicio" es obligatorio.' })
  hora_inicio!: string;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/, {
    message: 'El campo "hora_fin" debe tener formato HH:MM o HH:MM:SS.',
  })
  @IsNotEmpty({ message: 'El campo "hora_fin" es obligatorio.' })
  hora_fin!: string;

  @IsUUID('4', { message: 'El campo "ubicacion_id" debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'El campo "ubicacion_id" es obligatorio.' })
  ubicacion_id!: string;

  @IsString({ message: 'El campo "requisitos" debe ser texto.' })
  @IsNotEmpty({ message: 'El campo "requisitos" es obligatorio.' })
  @MaxLength(2000, {
    message: 'El campo "requisitos" no puede exceder $constraint1 caracteres.',
  })
  @Transform(({ value }) => sanitizeString(value))
  requisitos!: string;
}
