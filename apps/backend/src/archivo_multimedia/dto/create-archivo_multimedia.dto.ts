import { Transform } from 'class-transformer';
import {
  IsMimeType,
  IsNotEmpty,
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

export class CreateArchivoMultimediaDto {
  @IsUUID('4', {
    message: 'El campo "subido_por_usuario_id" debe ser un UUID válido.',
  })
  @IsNotEmpty({ message: 'El campo "subido_por_usuario_id" es obligatorio.' })
  subido_por_usuario_id!: string;

  @IsString({ message: 'El campo "ruta_archivo" debe ser texto.' })
  @IsNotEmpty({ message: 'El campo "ruta_archivo" es obligatorio.' })
  @MaxLength(2000, {
    message:
      'El campo "ruta_archivo" no puede exceder $constraint1 caracteres.',
  })
  @Transform(({ value }) => sanitizeString(value))
  ruta_archivo!: string;

  @IsMimeType({ message: 'El campo "tipo_mime" debe ser un MIME type válido.' })
  @IsNotEmpty({ message: 'El campo "tipo_mime" es obligatorio.' })
  @MaxLength(50, {
    message:
      'El campo "tipo_mime" no puede tener más de $constraint1 caracteres.',
  })
  tipo_mime!: string;
}
