import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { ParticipanteAcceso } from './entities/participante-acceso.entity';
import { ParticipanteTipo } from './participante-tipo.enum';

export interface ParticipanteAccesoIdentity {
  tipo: ParticipanteTipo;
  referenciaId: string;
  congresoId: string;
}

@Injectable()
export class ParticipanteAccesoService {
  async findOrCreate(
    manager: EntityManager,
    identity: ParticipanteAccesoIdentity,
  ): Promise<ParticipanteAcceso> {
    const repository = manager.getRepository(ParticipanteAcceso);
    const existente = await repository
      .createQueryBuilder('participante')
      .innerJoinAndSelect('participante.congreso', 'congreso')
      .where('participante.tipo = :tipo', { tipo: identity.tipo })
      .andWhere('participante.referencia_id = :referenciaId', {
        referenciaId: identity.referenciaId,
      })
      .andWhere('congreso.id = :congresoId', {
        congresoId: identity.congresoId,
      })
      .setLock('pessimistic_write', undefined, ['participante'])
      .getOne();
    if (existente) return existente;

    await repository
      .createQueryBuilder()
      .insert()
      .values({
        tipo: identity.tipo,
        referencia_id: identity.referenciaId,
        congreso: { id: identity.congresoId },
      })
      .orIgnore()
      .execute();

    return repository
      .createQueryBuilder('participante')
      .innerJoinAndSelect('participante.congreso', 'congreso')
      .where('participante.tipo = :tipo', { tipo: identity.tipo })
      .andWhere('participante.referencia_id = :referenciaId', {
        referenciaId: identity.referenciaId,
      })
      .andWhere('congreso.id = :congresoId', {
        congresoId: identity.congresoId,
      })
      .getOneOrFail();
  }
}
