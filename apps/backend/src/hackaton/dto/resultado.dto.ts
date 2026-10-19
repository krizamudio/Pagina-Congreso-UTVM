import { IsEnum, IsOptional } from 'class-validator';
import { HackatonResultado } from '../enums/hackaton-resultado.enum';
export class AsignarResultadoDto {
  @IsOptional() @IsEnum(HackatonResultado) resultado!: HackatonResultado | null;
}
