import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DatabaseErrorHandlerService } from '../common/database/handle-database-error';
import { ResourceLockService } from '../common/resource-lock.service';
import { Congreso } from '../congreso/entities/congreso.entity';
import { DiaEvento } from './entities/dia-evento.entity';

export interface DiaEventoResponse {
  id: string;
  fechaEvento: string;
  etiqueta: string;
}

const MAX_DIAS_CONGRESO = 366;

@Injectable()
export class DiaEventoService {
  private readonly timeZone: string;

  constructor(
    @InjectRepository(DiaEvento)
    private readonly dias: Repository<DiaEvento>,
    @InjectRepository(Congreso)
    private readonly congresos: Repository<Congreso>,
    private readonly config: ConfigService,
    private readonly locks: ResourceLockService,
    private readonly dbErrors: DatabaseErrorHandlerService,
  ) {
    this.timeZone = this.config.get<string>(
      'CONGRESS_TIMEZONE',
      'America/Mexico_City',
    );
  }

  generar(congresoId: string): Promise<DiaEventoResponse[]> {
    return this.locks.withLock(`dias-congreso:${congresoId}`, () =>
      this.generarLocked(congresoId),
    );
  }

  async findByCongreso(congresoId: string): Promise<DiaEventoResponse[]> {
    await this.ensureCongreso(congresoId);
    const dias = await this.dias.find({
      where: { congreso: { id: congresoId } },
      order: { fecha_evento: 'ASC' },
    });
    return dias.map((dia) => this.toResponse(dia));
  }

  async findAuthorized(
    congresoId: string,
    diaIds: string[],
  ): Promise<DiaEvento[]> {
    const dias = await this.dias
      .createQueryBuilder('dia')
      .innerJoinAndSelect('dia.congreso', 'congreso')
      .where('congreso.id = :congresoId', { congresoId })
      .andWhere('dia.id IN (:...diaIds)', { diaIds })
      .getMany();

    if (dias.length !== new Set(diaIds).size) {
      throw new BadRequestException(
        'Uno o mas dias no pertenecen al congreso indicado',
      );
    }
    return dias;
  }

  private async generarLocked(
    congresoId: string,
  ): Promise<DiaEventoResponse[]> {
    const congreso = await this.ensureCongreso(congresoId);
    const inicio = this.toDateOnly(congreso.fecha_inicio);
    const fin = this.toDateOnly(congreso.fecha_fin);
    const fechas = this.expandRange(inicio, fin);

    const existentes = await this.dias.find({
      where: { congreso: { id: congresoId } },
    });
    const fechasExistentes = new Set(existentes.map((dia) => dia.fecha_evento));
    const nuevos = fechas
      .filter((fecha) => !fechasExistentes.has(fecha))
      .map((fecha) =>
        this.dias.create({
          congreso,
          fecha_evento: fecha,
          etiqueta: `Dia ${fechas.indexOf(fecha) + 1}`,
        }),
      );

    if (nuevos.length > 0) {
      try {
        await this.dias.save(nuevos);
      } catch (error) {
        this.dbErrors.handle(error);
      }
    }

    return this.findByCongreso(congresoId);
  }

  private async ensureCongreso(id: string): Promise<Congreso> {
    const congreso = await this.congresos.findOneBy({ id });
    if (!congreso) {
      throw new NotFoundException('Congreso no encontrado');
    }
    return congreso;
  }

  private expandRange(inicio: string, fin: string): string[] {
    const current = new Date(`${inicio}T00:00:00.000Z`);
    const last = new Date(`${fin}T00:00:00.000Z`);
    const fechas: string[] = [];

    while (current <= last) {
      if (fechas.length >= MAX_DIAS_CONGRESO) {
        throw new BadRequestException(
          'El rango del congreso es demasiado largo',
        );
      }
      fechas.push(current.toISOString().slice(0, 10));
      current.setUTCDate(current.getUTCDate() + 1);
    }

    if (fechas.length === 0) {
      throw new BadRequestException(
        'El rango de fechas del congreso es invalido',
      );
    }
    return fechas;
  }

  private toDateOnly(value: Date): string {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: this.timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(value);
    const get = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((part) => part.type === type)?.value;
    return `${get('year')}-${get('month')}-${get('day')}`;
  }

  private toResponse(dia: DiaEvento): DiaEventoResponse {
    return {
      id: dia.id,
      fechaEvento: dia.fecha_evento,
      etiqueta: dia.etiqueta,
    };
  }
}
