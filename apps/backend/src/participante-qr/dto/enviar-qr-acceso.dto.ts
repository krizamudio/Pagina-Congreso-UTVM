import { ArrayMinSize, ArrayUnique, IsArray, IsUUID } from 'class-validator';

export class EnviarQrAccesoDto {
  @IsUUID('4')
  congresoId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsUUID('4', { each: true })
  diaEventoIds!: string[];
}
