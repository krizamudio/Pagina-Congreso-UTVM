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
  apellidoMaterno?: string;

  @IsEmail()
  correo!: string;

  @IsString()
  @IsNotEmpty()
  telefono!: string;

  @IsString()
  @IsNotEmpty()
  institucion!: string;

  @IsArray()
  dias!: string[];

  @IsNumber()
  total!: number;

  @IsString()
  @IsNotEmpty()
  comprobante!: string;

  

}