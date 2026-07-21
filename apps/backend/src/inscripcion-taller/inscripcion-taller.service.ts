import { Injectable } from '@nestjs/common';

import { InscripcionTallerService as TallerInscripcionService } from '../taller/services/inscripcion-taller.service';
import { CrearInscripcionTallerDto } from './dto/crear-inscripcion-taller.dto';

@Injectable()
export class InscripcionTallerService {
  constructor(private readonly inscripciones: TallerInscripcionService) {}

  async inscribir(dto: CrearInscripcionTallerDto) {
    const inscripcion = await this.inscripciones.create(dto.tallerId, {
      tipoParticipante: dto.tipoParticipante,
      referenciaId: dto.participanteId,
    });

    return {
      mensaje: 'Inscripción realizada correctamente.',
      inscripcion: {
        id: inscripcion.id,
        tallerId: inscripcion.taller.id,
        taller: inscripcion.taller.titulo,
        participanteId: dto.participanteId,
        tipoParticipante: dto.tipoParticipante,
        fechaInscripcion: inscripcion.created_at,
      },
    };
  }
}
