/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { InternalServerErrorException } from '@nestjs/common';

import { ReconocimientoEstado } from './enums/reconocimiento-estado.enum';
import { ReconocimientoTipo } from './enums/reconocimiento-tipo.enum';
import { ReconocimientoService } from './reconocimiento.service';

describe('ReconocimientoService', () => {
  const reconocimiento = {
    id: 'reconocimiento-1',
    tipo: ReconocimientoTipo.GENERAL,
    estado: ReconocimientoEstado.PENDIENTE,
    nombre_destinatario: 'María Pérez',
  };

  function setup(render: jest.Mock) {
    const set = jest.fn().mockReturnThis();
    const where = jest.fn().mockReturnThis();
    const andWhere = jest.fn().mockReturnThis();
    const execute = jest.fn().mockResolvedValue(undefined);
    const repository = {
      findOne: jest.fn().mockResolvedValue(reconocimiento),
      createQueryBuilder: jest.fn(() => ({
        update: jest.fn().mockReturnThis(),
        set,
        where,
        andWhere,
        execute,
      })),
    };
    const service = new ReconocimientoService(
      repository as never,
      {
        render,
      } as never,
    );
    return { service, set };
  }

  it('registra emisión, intento y hash SHA-256 al generar', async () => {
    const { service, set } = setup(
      jest.fn().mockResolvedValue(Buffer.from('%PDF-prueba')),
    );
    const result = await service.generatePdf(reconocimiento.id);

    expect(result.pdf.toString()).toBe('%PDF-prueba');
    expect(set).toHaveBeenCalledWith(
      expect.objectContaining({
        estado: ReconocimientoEstado.EMITIDO,
        ultimo_pdf_sha256:
          '896dcc9c7aed46be58ec408ac25583adbbcb9934db3484e5470d611aceb2f192',
      }),
    );
  });

  it('registra un fallo y permite que una descarga posterior reintente', async () => {
    const render = jest
      .fn()
      .mockRejectedValueOnce(new Error('detalle interno'))
      .mockResolvedValueOnce(Buffer.from('%PDF-reintento'));
    const { service, set } = setup(render);

    await expect(service.generatePdf(reconocimiento.id)).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
    await expect(service.generatePdf(reconocimiento.id)).resolves.toEqual(
      expect.objectContaining({ pdf: Buffer.from('%PDF-reintento') }),
    );
    expect(set).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        ultimo_error: expect.stringContaining('detalle interno'),
      }),
    );
    expect(set).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ estado: ReconocimientoEstado.FALLIDO }),
    );
    expect(set).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({ estado: ReconocimientoEstado.EMITIDO }),
    );
  });
});
