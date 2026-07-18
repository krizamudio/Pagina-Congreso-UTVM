/// <reference types="jest" />

import { Repository } from 'typeorm';

import { Noticia } from '../entities/noticia.entity';
import { ContenidoSlugService } from './contenido-slug.service';

describe('ContenidoSlugService', () => {
  it('normaliza acentos y caracteres especiales', async () => {
    const repository = {
      exists: jest.fn().mockResolvedValue(false),
    } as unknown as Repository<Noticia>;
    const service = new ContenidoSlugService(repository);

    await expect(
      service.generate('  Innovación y Tecnología 2026  '),
    ).resolves.toBe('innovacion-y-tecnologia-2026');
  });

  it('agrega un sufijo cuando el slug ya existe', async () => {
    const repository = {
      exists: jest
        .fn()
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false),
    } as unknown as Repository<Noticia>;
    const service = new ContenidoSlugService(repository);

    await expect(service.generate('Noticia')).resolves.toBe('noticia-3');
  });
});
