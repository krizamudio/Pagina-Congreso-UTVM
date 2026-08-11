import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateHackatonDto {
  @IsUUID() congreso_id!: string;
  @IsString() @IsNotEmpty() @MaxLength(180) @Transform(trim) nombre!: string;
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  @Transform(trim)
  descripcion!: string;
  @IsDateString({ strict: true }) fecha_inicio!: string;
  @IsDateString({ strict: true }) fecha_fin!: string;
}
