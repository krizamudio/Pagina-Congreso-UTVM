import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { RevocarCodigoQrDto } from './dto/revocar-codigo-qr.dto';
import { CodigoQr } from './entities/codigo-qr.entity';

@Injectable()
export class CodigoQrService {
  constructor(private readonly dataSource: DataSource) {}

  async revoke(id: string, dto: RevocarCodigoQrDto): Promise<string> {
    await this.dataSource.transaction(async (manager) => {
      const codigo = await manager.findOne(CodigoQr, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!codigo) {
        throw new NotFoundException('Codigo QR no encontrado');
      }
      if (!codigo.activo) return;

      codigo.activo = false;
      codigo.fecha_revocacion = new Date();
      codigo.motivo_revocacion = dto.motivo?.trim() || 'REVOCACION_MANUAL';
      await manager.save(codigo);
    });

    return 'Codigo QR revocado correctamente';
  }
}
