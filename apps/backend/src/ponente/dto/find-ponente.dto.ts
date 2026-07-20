import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

import { PonenteTipo } from '../enums/ponente-tipo.enum';

export class FindPonenteDto {
  @IsOptional()
  @IsEnum(PonenteTipo, {
    message: 'El tipo debe ser Ponente o Panelista',
  })
  tipo?: PonenteTipo;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}
