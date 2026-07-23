import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import { POSTGRES_INTEGER_MAX } from '../../common/database/postgres-limits.constant';
import { trimString } from './dto-transformers';

export class CreateBannerDto {
  @IsUUID('4', { message: 'El campo "congreso_id" debe ser un UUID válido.' })
  congreso_id!: string;

  @IsUUID('4', {
    message: 'El campo "archivo_multimedia_id" debe ser un UUID válido.',
  })
  archivo_multimedia_id!: string;

  @Transform(({ value }) => trimString(value))
  @IsString({ message: 'El campo "titulo" debe ser texto.' })
  @MaxLength(150)
  @IsOptional()
  titulo?: string | null;

  @Transform(({ value }) => trimString(value))
  @IsUrl(
    { protocols: ['http', 'https'], require_protocol: true },
    { message: 'El campo "url_enlace" debe ser una URL HTTP(S) válida.' },
  )
  @MaxLength(500)
  @IsOptional()
  url_enlace?: string | null;

  @IsBoolean({ message: 'El campo "activo" debe ser booleano.' })
  @IsOptional()
  activo?: boolean;

  @Type(() => Number)
  @IsInt({ message: 'El campo "orden" debe ser un entero.' })
  @Min(0)
  @Max(POSTGRES_INTEGER_MAX)
  @IsOptional()
  orden?: number;
}
