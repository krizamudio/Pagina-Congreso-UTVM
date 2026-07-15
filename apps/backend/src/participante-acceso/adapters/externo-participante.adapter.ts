import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { Externo } from '../../externos/entities/externo.entity';
import { ParticipanteAdapter } from '../interfaces/participante-adapter.interface';
import { ParticipanteResuelto } from '../interfaces/participante-resuelto.interface';
import { ParticipanteTipo } from '../participante-tipo.enum';

@Injectable()
export class ExternoParticipanteAdapter implements ParticipanteAdapter {
  readonly tipo = ParticipanteTipo.EXTERNO;

  constructor(
    @InjectRepository(Externo)
    private readonly repository: Repository<Externo>,
  ) {}

  async resolve(
    referenciaId: string,
    manager?: EntityManager,
  ): Promise<ParticipanteResuelto> {
    const participante = await (
      manager?.getRepository(Externo) ?? this.repository
    ).findOneBy({ id: referenciaId });
    if (!participante) {
      throw new NotFoundException('Participante externo no encontrado');
    }
    if (!participante.correoVerificado || participante.status !== 'validado') {
      throw new UnprocessableEntityException({
        resultado: 'PARTICIPANTE_NO_VALIDADO',
        message: 'El participante externo no esta validado',
      });
    }
    return {
      tipo: this.tipo,
      referenciaId,
      nombreCompleto: [
        participante.nombre,
        participante.apellidoPaterno,
        participante.apellidoMaterno,
      ]
        .filter(Boolean)
        .join(' '),
      correo: participante.correo,
    };
  }
}
