import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { POSTGRES_NUMERIC_10_2_MAX } from '../../common/database/postgres-limits.constant';
import { UploadedFile } from '../types/uploaded-file.type';

export class CreateParticipanteNsuDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre completo es obligatorio' })
  @MaxLength(200)
  nombreCompleto!: string;

  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @MaxLength(150)
  correo!: string;

  @IsString()
  @IsNotEmpty({ message: 'La institución es obligatoria' })
  @MaxLength(200)
  institucion!: string;

  @IsString()
  @IsNotEmpty({ message: 'La carrera es obligatoria' })
  @MaxLength(200)
  carrera!: string;

  @IsString()
  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  @Matches(/^\d+$/, { message: 'El teléfono solo debe contener números' })
  @Length(10, 10, { message: 'El teléfono debe tener 10 dígitos' })
  telefono!: string;

  @IsString()
  @IsNotEmpty({ message: 'Debes seleccionar al menos un día' })
  @MaxLength(100)
  dias!: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'El monto debe ser numérico' })
  @Min(0, { message: 'El monto no puede ser negativo' })
  @Max(POSTGRES_NUMERIC_10_2_MAX, {
    message: `El monto no puede ser mayor a ${POSTGRES_NUMERIC_10_2_MAX}`,
  })
  montoNumero!: number;
}

export class CreateRegistroNsuDto {
  @IsArray({ message: 'Los participantes deben enviarse como arreglo' })
  @ArrayMinSize(1, {
    message: 'Debe registrar al menos un participante',
  })
  @ValidateNested({ each: true })
  @Type(() => CreateParticipanteNsuDto)
  participantes!: CreateParticipanteNsuDto[];

  comprobante!: UploadedFile;
}
