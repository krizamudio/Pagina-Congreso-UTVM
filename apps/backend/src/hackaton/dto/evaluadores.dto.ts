import { ArrayUnique, IsArray, IsUUID } from 'class-validator';
export class ReemplazarEvaluadoresDto {
  @IsArray() @ArrayUnique() @IsUUID('4', { each: true }) ponente_ids!: string[];
}
