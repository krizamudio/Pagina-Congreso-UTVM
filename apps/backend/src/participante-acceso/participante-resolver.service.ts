import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { EmsParticipanteAdapter } from './adapters/ems-participante.adapter';
import { ExternoParticipanteAdapter } from './adapters/externo-participante.adapter';
import { NsuParticipanteAdapter } from './adapters/nsu-participante.adapter';
import { UtvmParticipanteAdapter } from './adapters/utvm-participante.adapter';
import { ParticipanteAdapter } from './interfaces/participante-adapter.interface';
import { ParticipanteResuelto } from './interfaces/participante-resuelto.interface';
import { ParticipanteTipo } from './participante-tipo.enum';

@Injectable()
export class ParticipanteResolverService {
  private readonly adapters: Map<ParticipanteTipo, ParticipanteAdapter>;

  constructor(
    utvm: UtvmParticipanteAdapter,
    ems: EmsParticipanteAdapter,
    externo: ExternoParticipanteAdapter,
    nsu: NsuParticipanteAdapter,
  ) {
    this.adapters = new Map(
      [utvm, ems, externo, nsu].map((adapter) => [adapter.tipo, adapter]),
    );
  }

  resolve(
    tipo: ParticipanteTipo,
    referenciaId: string,
    manager?: EntityManager,
  ): Promise<ParticipanteResuelto> {
    const adapter = this.adapters.get(tipo);
    if (!adapter) {
      throw new Error(`Tipo de participante no soportado: ${tipo}`);
    }
    return adapter.resolve(referenciaId, manager);
  }
}
