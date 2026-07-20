import { IsIn, IsString } from 'class-validator';

export class UpdateRegistroNsuDto {
  @IsString()
  @IsIn(['PENDIENTE', 'VALIDADO', 'RECHAZADO'])
  estado_pago!: string;
}
