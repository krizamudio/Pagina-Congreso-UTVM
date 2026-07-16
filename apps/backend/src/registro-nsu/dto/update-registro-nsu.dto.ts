import { PartialType } from '@nestjs/mapped-types';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { CreateRegistroNsuDto } from './create-registro-nsu.dto';

export class UpdateRegistroNsuDto extends PartialType(CreateRegistroNsuDto) {
  @IsOptional()
  @IsString()
  @IsIn(['PENDIENTE', 'VALIDADO', 'RECHAZADO'])
  estado_pago?: string;
}
