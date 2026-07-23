import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { POSTGRES_NUMERIC_10_2_MAX } from '../../common/database/postgres-limits.constant';

export class CreateExternoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  apellidoPaterno!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  apellidoMaterno?: string | null;

  @IsEmail()
  @MaxLength(150)
  correo!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  telefono!: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  institucion?: string | null;

  @IsArray()
  dias!: string[];

  @IsNumber()
  @Min(0)
  @Max(POSTGRES_NUMERIC_10_2_MAX)
  total!: number;
}
