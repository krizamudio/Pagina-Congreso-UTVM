/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/unbound-method */
import { NotFoundException } from '@nestjs/common';
import type { EntityManager, Repository } from 'typeorm';

import { ComprobanteService } from './comprobante.service';
import type { ComprobanteStorageService } from './comprobante-storage.service';
import type { ArchivoComprobante } from './entities/archivo-comprobante.entity';
import type { ArchivoRetryService } from '../archivo_multimedia/services';

describe('ComprobanteService', () => {
  const archivo = {
    originalname: 'pago.pdf',
    mimetype: 'application/pdf',
    size: 8,
    buffer: Buffer.from('%PDF-1.7'),
  };

  function setup() {
    const queryBuilder = {
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    };
    const repository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    } as unknown as Repository<ArchivoComprobante>;
    const storage = {
      upload: jest.fn().mockResolvedValue('nsu/archivo.pdf'),
      remove: jest.fn().mockResolvedValue(undefined),
      createSignedUrl: jest.fn().mockResolvedValue('https://firma.test'),
    } as unknown as ComprobanteStorageService;
    const retry = {
      compensate: jest.fn(async (_descripcion, operation) => {
        await operation();
        return true;
      }),
    } as unknown as ArchivoRetryService;
    const service = new ComprobanteService(repository, storage, retry);

    return { queryBuilder, storage, retry, service };
  }

  it('compensa el objeto cuando falla guardar los metadatos', async () => {
    const { service, storage, retry } = setup();
    const transactionalRepository = {
      create: jest.fn((data) => data),
      save: jest.fn().mockRejectedValue(new Error('database error')),
    };
    const manager = {
      getRepository: jest.fn().mockReturnValue(transactionalRepository),
    } as unknown as EntityManager;

    await expect(service.create(archivo, 'nsu', manager)).rejects.toThrow(
      'database error',
    );
    expect(retry.compensate).toHaveBeenCalled();
    expect(storage.remove).toHaveBeenCalledWith('nsu/archivo.pdf');
  });

  it('genera acceso firmado solo para comprobantes existentes', async () => {
    const { service, queryBuilder, storage } = setup();
    queryBuilder.getOne.mockResolvedValue({ path: 'externos/archivo.pdf' });

    await expect(service.getSignedUrl('voucher-id')).resolves.toBe(
      'https://firma.test',
    );
    expect(storage.createSignedUrl).toHaveBeenCalledWith(
      'externos/archivo.pdf',
    );
  });

  it('responde no encontrado sin solicitar una firma', async () => {
    const { service, queryBuilder, storage } = setup();
    queryBuilder.getOne.mockResolvedValue(null);

    await expect(service.getSignedUrl('voucher-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(storage.createSignedUrl).not.toHaveBeenCalled();
  });
});
