import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'node:crypto';
import { DataSource, Repository } from 'typeorm';
import { Reconocimiento } from '../../reconocimiento/entities/reconocimiento.entity';
import { ReconocimientoEstado } from '../../reconocimiento/enums/reconocimiento-estado.enum';
import { ReconocimientoTipo } from '../../reconocimiento/enums/reconocimiento-tipo.enum';
import { ReconocimientoRendererService } from '../../reconocimiento/services/reconocimiento-renderer.service';
import { ParticipanteResolverService } from '../../participante-acceso/participante-resolver.service';
import { HackatonEquipo } from '../entities/hackaton-equipo.entity';
import { HackatonEvaluador } from '../entities/hackaton-evaluador.entity';
import { Hackaton } from '../entities/hackaton.entity';
import { HACKATON_RESULTADO_LABEL } from '../enums/hackaton-resultado.enum';
import { buildZip } from './zip-builder';

@Injectable()
export class HackatonReconocimientosService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Reconocimiento)
    private readonly reconocimientos: Repository<Reconocimiento>,
    private readonly renderer: ReconocimientoRendererService,
    private readonly participantResolver: ParticipanteResolverService,
  ) {}
  async evaluadoresZip(hackatonId: string) {
    const hackaton = await this.dataSource.getRepository(Hackaton).findOne({
      where: { id: hackatonId },
      relations: { congreso: true, evaluadores: { ponente: true } },
    });
    if (!hackaton) throw new NotFoundException('Hackatón no encontrado');
    if (!hackaton.evaluadores.length)
      throw new BadRequestException(
        'El Hackatón no tiene evaluadores asignados',
      );
    const jobs = await Promise.all(
      hackaton.evaluadores.map((a) =>
        this.prepare({
          key: `hackaton:${hackaton.id}:evaluador:${a.ponente.id}`,
          hackaton,
          ponenteId: a.ponente.id,
          type: ReconocimientoTipo.HACKATON_EVALUADOR,
          name: a.ponente.nombre,
        }),
      ),
    );
    const files = await this.renderLimited(
      jobs.map((recognition) => ({
        recognition,
        context: {
          participacion: `Participación como evaluador de ${hackaton.nombre}`,
        },
      })),
    );
    await this.dataSource
      .getRepository(HackatonEvaluador)
      .createQueryBuilder()
      .update()
      .set({
        reconocimiento_emitido_at: () =>
          'COALESCE(reconocimiento_emitido_at, CURRENT_TIMESTAMP)',
      })
      .where('hackaton_id = :hackatonId', { hackatonId })
      .execute();
    return {
      zip: buildZip(files),
      filename: `${this.safe(hackaton.nombre)}-evaluadores.zip`,
    };
  }
  async equipoZip(hackatonId: string, equipoId: string) {
    const team = await this.dataSource.getRepository(HackatonEquipo).findOne({
      where: { id: equipoId, hackaton: { id: hackatonId } },
      relations: {
        hackaton: { congreso: true },
        integrantes: { participante: true },
      },
    });
    if (!team) throw new NotFoundException('Equipo no encontrado');
    if (!team.resultado)
      throw new BadRequestException(
        'Debe asignarse un resultado antes de generar reconocimientos',
      );
    const names = await this.resolveNames(team);
    const jobs = await Promise.all(
      team.integrantes.map((item, index) =>
        this.prepare({
          key: `hackaton:${hackatonId}:equipo:${equipoId}:resultado:${team.resultado}:participante:${item.participante.id}`,
          hackaton: team.hackaton,
          equipo: team,
          participanteId: item.participante.id,
          type: ReconocimientoTipo.HACKATON_PREMIACION,
          name: names[index],
        }),
      ),
    );
    const label = HACKATON_RESULTADO_LABEL[team.resultado];
    const files = await this.renderLimited(
      jobs.map((recognition) => ({
        recognition,
        context: { equipo: team.nombre, resultado: label },
      })),
    );
    await this.dataSource.getRepository(HackatonEquipo).update(team.id, {
      reconocimientos_emitidos_at:
        team.reconocimientos_emitidos_at ?? new Date(),
    });
    return {
      zip: buildZip(files),
      filename: `${this.safe(team.nombre)}-${this.safe(label)}.zip`,
    };
  }
  private async resolveNames(team: HackatonEquipo): Promise<string[]> {
    return Promise.all(
      team.integrantes.map(
        async (i) =>
          (
            await this.participantResolver.resolve(
              i.participante.tipo,
              i.participante.referencia_id,
            )
          ).nombreCompleto,
      ),
    );
  }
  private async prepare(input: {
    key: string;
    hackaton: Hackaton;
    equipo?: HackatonEquipo;
    ponenteId?: string;
    participanteId?: string;
    type: ReconocimientoTipo;
    name: string;
  }) {
    await this.reconocimientos
      .createQueryBuilder()
      .insert()
      .values({
        clave_emision: input.key,
        congreso: input.hackaton.congreso,
        hackaton: input.hackaton,
        hackaton_equipo: input.equipo,
        ponente: input.ponenteId ? { id: input.ponenteId } : undefined,
        participante: input.participanteId
          ? { id: input.participanteId }
          : undefined,
        tipo: input.type,
        nombre_destinatario: input.name,
        estado: ReconocimientoEstado.PENDIENTE,
        intentos: 0,
      })
      .orIgnore()
      .execute();
    return this.reconocimientos.findOneByOrFail({ clave_emision: input.key });
  }
  private async renderLimited(
    jobs: {
      recognition: Reconocimiento;
      context: { equipo?: string; resultado?: string; participacion?: string };
    }[],
  ) {
    const results = Array.from<{ name: string; data: Buffer } | undefined>({
      length: jobs.length,
    });
    let cursor = 0;
    const worker = async () => {
      while (cursor < jobs.length) {
        const index = cursor++;
        const job = jobs[index];
        try {
          const pdf = await this.renderer.render(
            job.recognition.tipo,
            job.recognition.nombre_destinatario,
            job.context,
          );
          await this.reconocimientos.update(job.recognition.id, {
            estado: ReconocimientoEstado.EMITIDO,
            intentos: job.recognition.intentos + 1,
            primera_fecha_emision:
              job.recognition.primera_fecha_emision ?? new Date(),
            ultimo_error: null,
            ultimo_pdf_sha256: createHash('sha256').update(pdf).digest('hex'),
          });
          results[index] = {
            name: `${this.safe(job.recognition.nombre_destinatario)}.pdf`,
            data: pdf,
          };
        } catch (error) {
          await this.reconocimientos.update(job.recognition.id, {
            estado: ReconocimientoEstado.FALLIDO,
            intentos: job.recognition.intentos + 1,
            ultimo_error: error instanceof Error ? error.stack : String(error),
          });
          throw error;
        }
      }
    };
    try {
      await Promise.all(
        Array.from({ length: Math.min(4, jobs.length) }, () => worker()),
      );
      return results.filter(
        (item): item is { name: string; data: Buffer } => item !== undefined,
      );
    } catch {
      throw new InternalServerErrorException(
        'No fue posible generar el lote completo; puede reintentarlo',
      );
    }
  }
  private safe(value: string): string {
    return (
      value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 100) || 'reconocimiento'
    );
  }
}
