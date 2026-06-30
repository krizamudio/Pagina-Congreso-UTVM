import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class CreateUtvmDto {
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

  @IsInt()
  @Min(1)
  @Max(11)
  cuatrimestre!: number;

  @IsString()
  @IsNotEmpty()
  grupo!: string;

  @IsString()
  @Length(10, 15)
  telefono!: string;
}
