import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateExternoDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  apellidoPaterno!: string;

  @IsOptional()
  @IsString()
  apellidoMaterno?: string | null;

  @IsEmail()
  correo!: string;

  @IsString()
  @IsNotEmpty()
  telefono!: string;

  @IsOptional()
  @IsString()
  institucion?: string | null;

  @IsArray()
  dias!: string[];

  @IsNumber()
  total!: number;

  @IsString()
  @IsNotEmpty()
  verificationToken!: string;
}