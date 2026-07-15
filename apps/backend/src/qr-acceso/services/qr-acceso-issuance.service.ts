import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

import { CodigoQr } from '../../codigo-qr/entities/codigo-qr.entity';
import { ResourceLockService } from '../../common/resource-lock.service';
import { DiaEventoService } from '../../dia-evento/dia-evento.service';
import { ParticipanteAcceso } from '../../participante-acceso/entities/participante-acceso.entity';
import { ParticipanteResolverService } from '../../participante-acceso/participante-resolver.service';
import { QrGeneratorService } from '../../qr-generator/qr-generator.service';
import {
  EmitirQrAccesoData,
  QrAccesoEmitido,
} from '../interfaces/emitir-qr-acceso.interface';
import { DiaParticipante } from '../entities/dia-participante.entity';
import { QrAcceso } from '../entities/qr-acceso.entity';

@Injectable()
export class QrAccesoIssuanceService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly generator: QrGeneratorService,
    private readonly resolver: ParticipanteResolverService,
    private readonly dias: DiaEventoService,
    private readonly locks: ResourceLockService,
  ) {}

  async issue(data: EmitirQrAccesoData): Promise<QrAccesoEmitido> {
    const lockKey = `qr:${data.tipo}:${data.referenciaId}:${data.congresoId}`;
    return this.locks.withLock(lockKey, async () => {
      const participante = await this.resolver.resolve(
        data.tipo,
        data.referenciaId,
      );
      const dias = await this.dias.findAuthorized(
        data.congresoId,
        data.diaEventoIds,
      );
      const generated = await this.generator.generateAccessQr();

      const codigoQrId = await this.dataSource.transaction(async (manager) => {
        const acceso = await this.findOrCreateParticipante(manager, data);
        await manager
          .createQueryBuilder()
          .insert()
          .into(DiaParticipante)
          .values(
            dias.map((dia) => ({
              participante_id: acceso.id,
              dia_evento_id: dia.id,
              acceso_utilizado: false,
              fecha_ingreso: null,
            })),
          )
          .orIgnore()
          .execute();

        const relacion = await manager
          .getRepository(QrAcceso)
          .createQueryBuilder('relacion')
          .innerJoinAndSelect('relacion.codigo_qr', 'codigo_qr')
          .where('relacion.participante_id = :participanteId', {
            participanteId: acceso.id,
          })
          .setLock('pessimistic_write', undefined, ['relacion'])
          .getOne();
        if (relacion?.codigo_qr.activo) {
          relacion.codigo_qr.activo = false;
          relacion.codigo_qr.fecha_revocacion = new Date();
          relacion.codigo_qr.motivo_revocacion = 'REGENERACION';
          await manager.save(relacion.codigo_qr);
        }

        const codigo = await manager.save(
          manager.create(CodigoQr, {
            token_hash: generated.tokenHash,
            tipo: 'acceso',
            activo: true,
            fecha_expiracion: null,
            fecha_revocacion: null,
            motivo_revocacion: null,
          }),
        );

        if (relacion) {
          relacion.codigo_qr = codigo;
          await manager.save(relacion);
        } else {
          await manager.save(
            manager.create(QrAcceso, {
              codigo_qr: codigo,
              participante: acceso,
            }),
          );
        }
        return codigo.id;
      });

      return {
        codigoQrId,
        participante,
        accessUrl: generated.accessUrl,
        qrPng: generated.png,
      };
    });
  }

  private async findOrCreateParticipante(
    manager: EntityManager,
    data: EmitirQrAccesoData,
  ): Promise<ParticipanteAcceso> {
    const repository = manager.getRepository(ParticipanteAcceso);
    const existente = await repository
      .createQueryBuilder('participante')
      .innerJoinAndSelect('participante.congreso', 'congreso')
      .where('participante.tipo = :tipo', { tipo: data.tipo })
      .andWhere('participante.referencia_id = :referenciaId', {
        referenciaId: data.referenciaId,
      })
      .andWhere('congreso.id = :congresoId', {
        congresoId: data.congresoId,
      })
      .setLock('pessimistic_write', undefined, ['participante'])
      .getOne();
    if (existente) return existente;

    return repository.save(
      repository.create({
        tipo: data.tipo,
        referencia_id: data.referenciaId,
        congreso: { id: data.congresoId },
      }),
    );
  }
}
