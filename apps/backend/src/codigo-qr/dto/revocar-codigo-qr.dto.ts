import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RevocarCodigoQrDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  motivo?: string;
}
