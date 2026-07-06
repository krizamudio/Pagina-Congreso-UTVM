import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateEmsDto {
  @IsString()
  @IsNotEmpty()
  nombres!: string;

  @IsString()
  @IsNotEmpty()
  apellidoPaterno!: string;

  @IsString()
  @IsOptional()
  apellidoMaterno?: string;

  @IsEmail()
  correo!: string;

  @IsString()
  @IsNotEmpty()
  institucion!: string;

  @IsString()
  @IsNotEmpty()
  carrera!: string;

  @IsString()
  @Length(10, 15)
  telefono!: string;
}
