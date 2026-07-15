import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Congreso } from '../congreso/entities/congreso.entity';
import { DiaEventoService } from '../dia-evento/dia-evento.service';
import { EnviarQrAccesoDto } from './dto/enviar-qr-acceso.dto';

@Injectable()
export class ParticipanteQrAsignacionService {
  constructor(
    @InjectRepository(Congreso)
    private readonly congresos: Repository<Congreso>,
    private readonly diasEvento: DiaEventoService,
  ) {}

  async resolver(
    diasSeleccionados?: string[] | string,
  ): Promise<EnviarQrAccesoDto> {
    const congreso = await this.congresos
      .createQueryBuilder('congreso')
      .where('congreso.fecha_fin::date >= CURRENT_DATE')
      .orderBy('congreso.fecha_inicio', 'ASC')
      .getOne();
    if (!congreso) {
      throw new NotFoundException('No hay un congreso vigente o proximo');
    }

    const dias = await this.diasEvento.generar(congreso.id);
    const ordinales = this.extraerOrdinales(diasSeleccionados);
    const seleccionProporcionada = Array.isArray(diasSeleccionados)
      ? diasSeleccionados.length > 0
      : Boolean(diasSeleccionados?.trim());
    if (seleccionProporcionada && ordinales.length === 0) {
      throw new BadRequestException(
        'No fue posible interpretar los dias seleccionados',
      );
    }
    const autorizados =
      ordinales.length === 0
        ? dias
        : dias.filter((_, index) => ordinales.includes(index + 1));

    if (autorizados.length === 0 || autorizados.length !== ordinales.length) {
      throw new BadRequestException(
        'Los dias seleccionados no corresponden al congreso disponible',
      );
    }

    return {
      congresoId: congreso.id,
      diaEventoIds: autorizados.map((dia) => dia.id),
    };
  }

  private extraerOrdinales(value?: string[] | string): number[] {
    if (!value) return [];
    const entries = Array.isArray(value) ? value : value.split(',');
    const ordinales = entries
      .map((entry) => entry.match(/\d+/)?.[0])
      .filter((entry): entry is string => Boolean(entry))
      .map(Number);
    return [...new Set(ordinales)];
  }
}
