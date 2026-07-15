import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { Utvm } from '../../utvm/entities/utvm.entity';
import { ParticipanteAdapter } from '../interfaces/participante-adapter.interface';
import { ParticipanteResuelto } from '../interfaces/participante-resuelto.interface';
import { ParticipanteTipo } from '../participante-tipo.enum';

@Injectable()
export class UtvmParticipanteAdapter implements ParticipanteAdapter {
  readonly tipo = ParticipanteTipo.UTVM;

  constructor(
    @InjectRepository(Utvm) private readonly repository: Repository<Utvm>,
  ) {}

  async resolve(
    referenciaId: string,
    manager?: EntityManager,
  ): Promise<ParticipanteResuelto> {
    const id = Number(referenciaId);
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new NotFoundException('Participante UTVM no encontrado');
    }
    const participante = await (
      manager?.getRepository(Utvm) ?? this.repository
    ).findOneBy({ id });
    if (!participante) {
      throw new NotFoundException('Participante UTVM no encontrado');
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
