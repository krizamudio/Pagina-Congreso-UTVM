import { IsEnum, IsUUID } from 'class-validator';

import { TipoParticipanteTaller } from '../entities/inscripcion-taller.entity';

export class CrearInscripcionTallerDto {
  @IsUUID('4', {
    message: 'El identificador del taller no es válido.',
  })
  tallerId!: string;

  @IsUUID('4', {
    message: 'El identificador del participante no es válido.',
  })
  participanteId!: string;

  @IsEnum(TipoParticipanteTaller, {
    message: 'El tipo de participante no es válido.',
  })
  tipoParticipante!: TipoParticipanteTaller;
}
