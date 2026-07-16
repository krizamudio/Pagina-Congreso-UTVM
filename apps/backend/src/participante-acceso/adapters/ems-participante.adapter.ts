import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { Ems } from '../../ems/entities/ems.entity';
import { ParticipanteAdapter } from '../interfaces/participante-adapter.interface';
import { ParticipanteResuelto } from '../interfaces/participante-resuelto.interface';
import { ParticipanteTipo } from '../participante-tipo.enum';

@Injectable()
export class EmsParticipanteAdapter implements ParticipanteAdapter {
  readonly tipo = ParticipanteTipo.EMS;

  constructor(
    @InjectRepository(Ems) private readonly repository: Repository<Ems>,
  ) {}

  async resolve(
    referenciaId: string,
    manager?: EntityManager,
  ): Promise<ParticipanteResuelto> {
    const id = Number(referenciaId);
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new NotFoundException('Participante EMS no encontrado');
    }
    const participante = await (
      manager?.getRepository(Ems) ?? this.repository
    ).findOneBy({ id });
    if (!participante) {
      throw new NotFoundException('Participante EMS no encontrado');
    }
    return {
      tipo: this.tipo,
      referenciaId,
      nombreCompleto: [
        participante.nombres,
        participante.apellidoPaterno,
        participante.apellidoMaterno,
      ]
        .filter(Boolean)
        .join(' '),
      correo: participante.correo,
    };
  }
}
