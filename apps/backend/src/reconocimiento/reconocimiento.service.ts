import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'node:crypto';
import { Repository } from 'typeorm';

import { FindReconocimientoDto } from './dto/find-reconocimiento.dto';
import { Reconocimiento } from './entities/reconocimiento.entity';
import { ReconocimientoEstado } from './enums/reconocimiento-estado.enum';
import { ReconocimientoRendererService } from './services/reconocimiento-renderer.service';
import { ReconocimientoEmisionService } from './services/reconocimiento-emision.service';

@Injectable()
export class ReconocimientoService {
  private readonly relations = {
    congreso: true,
    taller: true,
    conferencia: true,
    participante: true,
    ponente: true,
  } as const;

  constructor(
    @InjectRepository(Reconocimiento)
    private readonly repository: Repository<Reconocimiento>,
    private readonly renderer: ReconocimientoRendererService,
    private readonly emision: ReconocimientoEmisionService,
  ) {}

  prepareForTaller(tallerId: string): Promise<void> {
    return this.emision.prepareTallerista(tallerId);
  }

  prepareForConferencia(conferenciaId: string): Promise<void> {
    return this.emision.prepareConferencista(conferenciaId);
  }

  async findAll(query: FindReconocimientoDto) {
    const builder = this.repository
      .createQueryBuilder('reconocimiento')
      .leftJoinAndSelect('reconocimiento.congreso', 'congreso')
      .leftJoinAndSelect('reconocimiento.taller', 'taller')
      .leftJoinAndSelect('reconocimiento.conferencia', 'conferencia')
      .leftJoinAndSelect('reconocimiento.participante', 'participante')
      .leftJoinAndSelect('reconocimiento.ponente', 'ponente')
      .orderBy('reconocimiento.created_at', 'DESC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit);
    if (query.congresoId) builder.andWhere('congreso.id = :congresoId', query);
    if (query.tallerId) builder.andWhere('taller.id = :tallerId', query);
    if (query.conferenciaId)
      builder.andWhere('conferencia.id = :conferenciaId', query);
    if (query.tipo) builder.andWhere('reconocimiento.tipo = :tipo', query);
    if (query.estado)
      builder.andWhere('reconocimiento.estado = :estado', query);
    const [data, total] = await builder.getManyAndCount();
    return { data, total, page: query.page, limit: query.limit };
  }

  async findOne(id: string): Promise<Reconocimiento> {
    const reconocimiento = await this.repository.findOne({
      where: { id },
      relations: this.relations,
    });
    if (!reconocimiento) {
      throw new NotFoundException('Reconocimiento no encontrado');
    }
    return reconocimiento;
  }

  async generatePdf(id: string): Promise<{
    pdf: Buffer;
    filename: string;
  }> {
    const reconocimiento = await this.findOne(id);
    try {
      const pdf = await this.renderer.render(
        reconocimiento.tipo,
        reconocimiento.nombre_destinatario,
      );
      const hash = createHash('sha256').update(pdf).digest('hex');
      await this.repository
        .createQueryBuilder()
        .update(Reconocimiento)
        .set({
          intentos: () => 'intentos + 1',
          estado: ReconocimientoEstado.EMITIDO,
          primera_fecha_emision: () =>
            'COALESCE(primera_fecha_emision, CURRENT_TIMESTAMP)',
          ultimo_error: null,
          ultimo_pdf_sha256: hash,
        })
        .where('id = :id', { id })
        .execute();
      return {
        pdf,
        filename: `reconocimiento-${id}.pdf`,
      };
    } catch (error) {
      const detail = error instanceof Error ? error.stack : String(error);
      await this.repository
        .createQueryBuilder()
        .update(Reconocimiento)
        .set({
          intentos: () => 'intentos + 1',
          ultimo_error: detail,
        })
        .where('id = :id', { id })
        .execute();
      await this.repository
        .createQueryBuilder()
        .update(Reconocimiento)
        .set({ estado: ReconocimientoEstado.FALLIDO })
        .where('id = :id', { id })
        .andWhere('estado <> :emitido', {
          emitido: ReconocimientoEstado.EMITIDO,
        })
        .execute();
      throw new InternalServerErrorException(
        'No fue posible generar el reconocimiento',
      );
    }
  }
}
