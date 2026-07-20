import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { ParticipanteTipo } from '../../participante-acceso/participante-tipo.enum';

export class CreateInscripcionTallerDto {
  @IsEnum(ParticipanteTipo)
  tipoParticipante!: ParticipanteTipo;

  // TODO: Obtener estos identificadores del usuario autenticado.
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  referenciaId!: string;
}
