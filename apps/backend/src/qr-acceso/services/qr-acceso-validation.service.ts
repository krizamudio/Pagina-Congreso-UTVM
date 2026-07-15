import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource, EntityManager } from 'typeorm';

import { CodigoQr } from '../../codigo-qr/entities/codigo-qr.entity';
import { DiaEvento } from '../../dia-evento/entities/dia-evento.entity';
import { ParticipanteResuelto } from '../../participante-acceso/interfaces/participante-resuelto.interface';
import { ParticipanteResolverService } from '../../participante-acceso/participante-resolver.service';
import { QrGeneratorService } from '../../qr-generator/qr-generator.service';
import { QrAccesoResponseDto } from '../dto/qr-acceso-response.dto';
import { DiaParticipante } from '../entities/dia-participante.entity';
import { QrAcceso } from '../entities/qr-acceso.entity';
import { QrResultado } from '../qr-resultado.enum';
import { QrAccessErrorService } from './qr-access-error.service';

interface AccessContext {
  participante: ParticipanteResuelto;
  dia: DiaEvento;
  acceso: DiaParticipante;
}

@Injectable()
export class QrAccesoValidationService {
  private readonly timeZone: string;

  constructor(
    private readonly dataSource: DataSource,
    private readonly generator: QrGeneratorService,
    private readonly resolver: ParticipanteResolverService,
    private readonly errors: QrAccessErrorService,
    config: ConfigService,
  ) {
    this.timeZone = config.get<string>(
      'CONGRESS_TIMEZONE',
      'America/Mexico_City',
    );
  }

  async inspect(token: string): Promise<QrAccesoResponseDto> {
    const context = await this.loadContext(
      this.dataSource.manager,
      token,
      false,
    );
    if (context.acceso.acceso_utilizado) {
      this.errors.fail(QrResultado.ACCESO_YA_UTILIZADO);
    }
    return this.toResponse(context, false);
  }

  confirm(token: string): Promise<QrAccesoResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      const context = await this.loadContext(manager, token, true);
      if (context.acceso.acceso_utilizado) {
        this.errors.fail(QrResultado.ACCESO_YA_UTILIZADO);
      }

      const fechaIngreso = new Date();
      const result = await manager.update(
        DiaParticipante,
        {
          participante_id: context.acceso.participante_id,
          dia_evento_id: context.acceso.dia_evento_id,
          acceso_utilizado: false,
        },
        { acceso_utilizado: true, fecha_ingreso: fechaIngreso },
      );
      if (result.affected !== 1) {
        this.errors.fail(QrResultado.ACCESO_YA_UTILIZADO);
      }

      return this.toResponse(context, true, fechaIngreso);
    });
  }

  private async loadContext(
    manager: EntityManager,
    token: string,
    lock: boolean,
  ): Promise<AccessContext> {
    const tokenHash = this.generator.hashToken(token);
    const codigo = await manager.findOne(CodigoQr, {
      where: { token_hash: tokenHash },
      ...(lock ? { lock: { mode: 'pessimistic_read' as const } } : {}),
    });
    if (!codigo) this.errors.fail(QrResultado.NO_ENCONTRADO);
    this.validateCode(codigo);

    const relacion = await manager.findOne(QrAcceso, {
      where: { codigo_qr: { id: codigo.id } },
      relations: { participante: { congreso: true } },
    });
    if (!relacion) this.errors.fail(QrResultado.NO_ENCONTRADO);

    let participante: ParticipanteResuelto;
    try {
      participante = await this.resolver.resolve(
        relacion.participante.tipo,
        relacion.participante.referencia_id,
        manager,
      );
    } catch {
      this.errors.fail(QrResultado.PARTICIPANTE_NO_VALIDADO);
    }

    const fecha = await this.currentDate(manager);
    const dia = await manager.findOne(DiaEvento, {
      where: {
        congreso: { id: relacion.participante.congreso.id },
        fecha_evento: fecha,
      },
      relations: { congreso: true },
    });
    if (!dia) this.errors.fail(QrResultado.FUERA_DE_FECHA);

    const acceso = await manager.findOne(DiaParticipante, {
      where: {
        participante_id: relacion.participante.id,
        dia_evento_id: dia.id,
      },
      ...(lock ? { lock: { mode: 'pessimistic_write' as const } } : {}),
    });
    if (!acceso) this.errors.fail(QrResultado.DIA_NO_AUTORIZADO);

    return { participante, dia, acceso };
  }

  private validateCode(codigo: CodigoQr): void {
    if (codigo.tipo !== 'acceso') {
      this.errors.fail(QrResultado.TIPO_INVALIDO);
    }
    if (!codigo.activo) {
      this.errors.fail(QrResultado.INACTIVO);
    }
    if (codigo.fecha_expiracion && codigo.fecha_expiracion <= new Date()) {
      this.errors.fail(QrResultado.EXPIRADO);
    }
  }

  private async currentDate(manager: EntityManager): Promise<string> {
    const rows: Array<{ fecha: string }> = await manager.query(
      `SELECT (CURRENT_TIMESTAMP AT TIME ZONE $1)::date::text AS fecha`,
      [this.timeZone],
    );
    return rows[0].fecha;
  }

  private toResponse(
    context: AccessContext,
    accesoUtilizado: boolean,
    fechaIngreso?: Date,
  ): QrAccesoResponseDto {
    return {
      valido: true,
      puedeIngresar: true,
      resultado: QrResultado.VALIDO,
      participante: {
        id: context.participante.referenciaId,
        nombreCompleto: context.participante.nombreCompleto,
        tipo: context.participante.tipo,
      },
      congreso: {
        id: context.dia.congreso.id,
        nombre: context.dia.congreso.nombre,
      },
      dia: {
        id: context.dia.id,
        fecha: context.dia.fecha_evento,
        accesoUtilizado,
        ...(fechaIngreso ? { fechaIngreso } : {}),
      },
    };
  }
}
