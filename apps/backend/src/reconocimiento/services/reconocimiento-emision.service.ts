import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Conferencia } from '../../conferencia/entities/conferencia.entity';
import { ParticipanteResolverService } from '../../participante-acceso/participante-resolver.service';
import { InscripcionTaller } from '../../taller/entities/inscripcion-taller.entity';
import { Taller } from '../../taller/entities/taller.entity';
import { Reconocimiento } from '../entities/reconocimiento.entity';
import { ReconocimientoEstado } from '../enums/reconocimiento-estado.enum';
import { ReconocimientoTipo } from '../enums/reconocimiento-tipo.enum';

@Injectable()
export class ReconocimientoEmisionService {
  private readonly logger = new Logger(ReconocimientoEmisionService.name);
  private readonly timezone =
    process.env.RECONOCIMIENTOS_TIMEZONE ??
    process.env.CONGRESS_TIMEZONE ??
    'America/Mexico_City';

  constructor(
    @InjectRepository(Reconocimiento)
    private readonly reconocimientos: Repository<Reconocimiento>,
    @InjectRepository(Taller)
    private readonly talleres: Repository<Taller>,
    @InjectRepository(Conferencia)
    private readonly conferencias: Repository<Conferencia>,
    @InjectRepository(InscripcionTaller)
    private readonly inscripciones: Repository<InscripcionTaller>,
    private readonly resolver: ParticipanteResolverService,
  ) {}

  async prepareFinishedActivities(): Promise<void> {
    await this.prepareTalleres();
    await this.prepareConferencias();
  }

  async prepareTallerista(tallerId: string): Promise<void> {
    const taller = await this.talleres.findOne({
      where: { id: tallerId },
      relations: { congreso: true, ponente: true },
    });
    if (!taller) throw new NotFoundException('Taller no encontrado');
    if (!taller.congreso) {
      throw new BadRequestException('El taller no tiene un congreso asignado');
    }
    if (!taller.ponente) {
      throw new BadRequestException(
        'El taller no tiene un ponente o panelista asignado',
      );
    }
    await this.insertIgnore({
      clave_emision: `taller:${taller.id}:ponente:${taller.ponente.id}`,
      congreso: taller.congreso,
      taller,
      ponente: taller.ponente,
      tipo: ReconocimientoTipo.TALLERISTA,
      nombre_destinatario: taller.ponente.nombre,
    });
  }

  async prepareConferencista(conferenciaId: string): Promise<void> {
    const conferencia = await this.conferencias.findOne({
      where: { id: conferenciaId },
      relations: { congreso: true, ponente: true },
    });
    if (!conferencia) {
      throw new NotFoundException('Conferencia no encontrada');
    }
    if (!conferencia.congreso) {
      throw new BadRequestException(
        'La conferencia no tiene un congreso asignado',
      );
    }
    if (!conferencia.ponente) {
      throw new BadRequestException(
        'La conferencia no tiene un ponente o panelista asignado',
      );
    }
    await this.insertIgnore({
      clave_emision: `conferencia:${conferencia.id}:ponente:${conferencia.ponente.id}`,
      congreso: conferencia.congreso,
      conferencia,
      ponente: conferencia.ponente,
      tipo: ReconocimientoTipo.CONFERENCISTA,
      nombre_destinatario: conferencia.ponente.nombre,
    });
  }

  private async prepareTalleres(): Promise<void> {
    const talleres = await this.talleres
      .createQueryBuilder('taller')
      .innerJoinAndSelect('taller.congreso', 'congreso')
      .leftJoinAndSelect('taller.ponente', 'ponente')
      .where(
        '(taller.fecha + taller.hora_fin) <= (CURRENT_TIMESTAMP AT TIME ZONE :timezone)',
        { timezone: this.timezone },
      )
      .getMany();

    for (const taller of talleres) {
      const inscripciones = await this.inscripciones.find({
        where: { taller: { id: taller.id } },
        relations: { participante: true },
      });
      for (const inscripcion of inscripciones) {
        try {
          const persona = await this.resolver.resolve(
            inscripcion.participante.tipo,
            inscripcion.participante.referencia_id,
          );
          await this.insertIgnore({
            clave_emision: `taller:${taller.id}:participante:${inscripcion.participante.id}`,
            congreso: taller.congreso!,
            taller,
            participante: inscripcion.participante,
            tipo: ReconocimientoTipo.GENERAL,
            nombre_destinatario: persona.nombreCompleto,
          });
        } catch (error) {
          this.logger.error(
            `No se pudo preparar el reconocimiento de la inscripción ${inscripcion.id}`,
            error instanceof Error ? error.stack : String(error),
          );
        }
      }
      if (taller.ponente) {
        await this.insertIgnore({
          clave_emision: `taller:${taller.id}:ponente:${taller.ponente.id}`,
          congreso: taller.congreso!,
          taller,
          ponente: taller.ponente,
          tipo: ReconocimientoTipo.TALLERISTA,
          nombre_destinatario: taller.ponente.nombre,
        });
      }
    }
  }

  private async prepareConferencias(): Promise<void> {
    const conferencias = await this.conferencias
      .createQueryBuilder('conferencia')
      .innerJoinAndSelect('conferencia.congreso', 'congreso')
      .innerJoinAndSelect('conferencia.ponente', 'ponente')
      .where(
        '(conferencia.fecha + conferencia.hora_fin) <= (CURRENT_TIMESTAMP AT TIME ZONE :timezone)',
        { timezone: this.timezone },
      )
      .getMany();
    for (const conferencia of conferencias) {
      await this.insertIgnore({
        clave_emision: `conferencia:${conferencia.id}:ponente:${conferencia.ponente!.id}`,
        congreso: conferencia.congreso!,
        conferencia,
        ponente: conferencia.ponente,
        tipo: ReconocimientoTipo.CONFERENCISTA,
        nombre_destinatario: conferencia.ponente!.nombre,
      });
    }
  }

  private async insertIgnore(
    value: Partial<Reconocimiento> &
      Pick<
        Reconocimiento,
        'clave_emision' | 'congreso' | 'tipo' | 'nombre_destinatario'
      >,
  ): Promise<void> {
    await this.reconocimientos
      .createQueryBuilder()
      .insert()
      .values({
        ...value,
        estado: ReconocimientoEstado.PENDIENTE,
        intentos: 0,
      })
      .orIgnore()
      .execute();
  }
}
