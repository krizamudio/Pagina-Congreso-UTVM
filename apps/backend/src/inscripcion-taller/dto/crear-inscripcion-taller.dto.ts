import { IsEnum, IsUUID } from 'class-validator';

import { ParticipanteTipo } from '../../participante-acceso/participante-tipo.enum';

export class CrearInscripcionTallerDto {
  @IsUUID('4', {
    message: 'El identificador del taller no es válido.',
  })
  tallerId!: string;

  @IsUUID('4', {
    message: 'El identificador del participante no es válido.',
  })
  participanteId!: string;

  @IsEnum(ParticipanteTipo, {
    message: 'El tipo de participante no es válido.',
  })
  tipoParticipante!: ParticipanteTipo;
}
