import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

import { ReconocimientoEstado } from '../enums/reconocimiento-estado.enum';
import { ReconocimientoTipo } from '../enums/reconocimiento-tipo.enum';

export class FindReconocimientoDto {
  @IsOptional()
  @IsUUID()
  congresoId?: string;

  @IsOptional()
  @IsUUID()
  tallerId?: string;

  @IsOptional()
  @IsUUID()
  conferenciaId?: string;

  @IsOptional()
  @IsEnum(ReconocimientoTipo)
  tipo?: ReconocimientoTipo;

  @IsOptional()
  @IsEnum(ReconocimientoEstado)
  estado?: ReconocimientoEstado;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}
