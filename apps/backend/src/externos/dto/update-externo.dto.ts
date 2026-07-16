import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';
import { CreateExternoDto } from './create-externo.dto';

export class UpdateExternoDto extends PartialType(CreateExternoDto) {
  @IsOptional()
  @IsString()
  @IsIn(['pendiente_verificacion', 'pendiente', 'validado', 'rechazado'])
  status?: string;

  @IsOptional()
  @IsBoolean()
  correoVerificado?: boolean;
}
