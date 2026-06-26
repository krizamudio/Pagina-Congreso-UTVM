import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsUUID,
  IsISO8601,
  Matches,
} from 'class-validator';

function sanitizeString(value: any) {
  if (typeof value !== 'string') return value;
  // Eliminar etiquetas HTML
  let s = value.replace(/<[^>]*>/g, '').trim();
  // Eliminar palabras clave comunes de SQL y caracteres peligrosos
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

export class CreateConferenciaDto {
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

  @IsUUID('4', { message: 'El campo "ponente_id" debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'El campo "ponente_id" es obligatorio.' })
  ponente_id!: string;

  @IsString({ message: 'El campo "resumen" debe ser texto.' })
  @IsNotEmpty({ message: 'El campo "resumen" es obligatorio.' })
  @MaxLength(2000, {
    message: 'El campo "resumen" no puede exceder $constraint1 caracteres.',
  })
  @Transform(({ value }) => sanitizeString(value))
  resumen!: string;

  @IsISO8601(
    { strict: true },
    { message: 'El campo "fecha" debe tener formato ISO (YYYY-MM-DD).' },
  )
  @IsNotEmpty({ message: 'El campo "fecha" es obligatorio.' })
  fecha!: string;

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

  @IsUUID('4', { message: 'El campo "sede_id" debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'El campo "sede_id" es obligatorio.' })
  sede_id!: string;
}
