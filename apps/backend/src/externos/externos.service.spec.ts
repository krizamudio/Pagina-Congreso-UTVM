/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/unbound-method */
import type { Repository } from 'typeorm';

import { ExternosService } from './externos.service';
import type { Externo } from './entities/externo.entity';
import type { ConfigService } from '@nestjs/config';
import type { DataSource } from 'typeorm';
import type { GeneradorCommon } from '../common/generador.common';
import type { ParticipanteQrEnvioService } from '../participante-qr/participante-qr-envio.service';
import type { ComprobanteService } from '../comprobante/comprobante.service';

describe('ExternosService', () => {
  it('solo lista participantes externos con correo verificado', async () => {
    const repository = {
      find: jest.fn().mockResolvedValue([]),
    } as unknown as Repository<Externo>;
    const service = new ExternosService(
      repository,
      {} as ConfigService,
      {} as GeneradorCommon,
      {} as ParticipanteQrEnvioService,
      {} as DataSource,
      {} as ComprobanteService,
    );

    await service.findAll();

    expect(repository.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          correoVerificado: true,
        }),
      }),
    );
  });
});
