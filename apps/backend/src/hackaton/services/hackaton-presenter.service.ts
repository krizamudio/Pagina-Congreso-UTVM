import { Injectable } from '@nestjs/common';
import { ParticipanteResolverService } from '../../participante-acceso/participante-resolver.service';
import { Hackaton } from '../entities/hackaton.entity';

@Injectable()
export class HackatonPresenterService {
  constructor(private readonly resolver: ParticipanteResolverService) {}

  async present(hackaton: Hackaton) {
    return {
      id: hackaton.id,
      nombre: hackaton.nombre,
      descripcion: hackaton.descripcion,
      fecha_inicio: hackaton.fecha_inicio,
      fecha_fin: hackaton.fecha_fin,
      congreso: hackaton.congreso && {
        id: hackaton.congreso.id,
        nombre: hackaton.congreso.nombre,
        fecha_inicio: hackaton.congreso.fecha_inicio,
        fecha_fin: hackaton.congreso.fecha_fin,
      },
      evaluadores: (hackaton.evaluadores ?? []).map((asignacion) => ({
        id: asignacion.id,
        bloqueado: Boolean(asignacion.reconocimiento_emitido_at),
        ponente: {
          id: asignacion.ponente.id,
          nombre: asignacion.ponente.nombre,
          institucion: asignacion.ponente.institucion,
          tipo: asignacion.ponente.tipo,
        },
      })),
      equipos: await Promise.all(
        (hackaton.equipos ?? []).map(async (equipo) => ({
          id: equipo.id,
          nombre: equipo.nombre,
          resultado: equipo.resultado ?? null,
          bloqueado: Boolean(equipo.reconocimientos_emitidos_at),
          integrantes: await Promise.all(
            (equipo.integrantes ?? []).map(async (integrante) => {
              const persona = await this.resolver.resolve(
                integrante.participante.tipo,
                integrante.participante.referencia_id,
              );
              return {
                id: integrante.id,
                participante_acceso_id: integrante.participante.id,
                tipo: integrante.participante.tipo,
                nombre: persona.nombreCompleto,
                correo: persona.correo,
              };
            }),
          ),
        })),
      ),
    };
  }
}
