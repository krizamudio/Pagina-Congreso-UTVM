import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { ParticipanteNsu } from '../../registro-nsu/entities/participante-nsu.entity';
import { ParticipanteAdapter } from '../interfaces/participante-adapter.interface';
import { ParticipanteResuelto } from '../interfaces/participante-resuelto.interface';
import { ParticipanteTipo } from '../participante-tipo.enum';

@Injectable()
export class NsuParticipanteAdapter implements ParticipanteAdapter {
  readonly tipo = ParticipanteTipo.NSU;

  constructor(
    @InjectRepository(ParticipanteNsu)
    private readonly repository: Repository<ParticipanteNsu>,
  ) {}

  async resolve(
    referenciaId: string,
    manager?: EntityManager,
  ): Promise<ParticipanteResuelto> {
    const participante = await (
      manager?.getRepository(ParticipanteNsu) ?? this.repository
    ).findOneBy({ id: referenciaId });
    if (!participante) {
      throw new NotFoundException('Participante NSU no encontrado');
    }
    if (
      !participante.correo_verificado ||
      participante.estado_pago !== 'VALIDADO'
    ) {
      throw new UnprocessableEntityException({
        resultado: 'PARTICIPANTE_NO_VALIDADO',
        message: 'El participante NSU no esta validado',
      });
    }
    return {
      tipo: this.tipo,
      referenciaId,
      nombreCompleto: participante.nombre_completo,
      correo: participante.correo,
    };
  }
}
