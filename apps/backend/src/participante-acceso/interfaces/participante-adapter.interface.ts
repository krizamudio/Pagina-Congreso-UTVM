import { EntityManager } from 'typeorm';

import { ParticipanteTipo } from '../participante-tipo.enum';
import { ParticipanteResuelto } from './participante-resuelto.interface';

export interface ParticipanteAdapter {
  readonly tipo: ParticipanteTipo;
  resolve(
    referenciaId: string,
    manager?: EntityManager,
  ): Promise<ParticipanteResuelto>;
}
