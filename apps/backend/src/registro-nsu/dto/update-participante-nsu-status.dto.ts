import { IsIn, IsString } from 'class-validator';

export class UpdateParticipanteNsuStatusDto {
  @IsString()
  @IsIn(['PENDIENTE', 'VALIDADO', 'RECHAZADO'])
  estado_pago!: string;
}
