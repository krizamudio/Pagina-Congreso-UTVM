import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { EntityManager } from 'typeorm';
import { Repository } from 'typeorm';

import { ArchivoRetryService } from '../archivo_multimedia/services';
import type { ArchivoSubido } from '../archivo_multimedia/services/archivo-validation.helper';
import { ArchivoComprobante } from './entities/archivo-comprobante.entity';
import {
  ComprobanteStorageService,
  type ComprobanteOrigen,
} from './comprobante-storage.service';

@Injectable()
export class ComprobanteService {
  constructor(
    @InjectRepository(ArchivoComprobante)
    private readonly repository: Repository<ArchivoComprobante>,
    private readonly storage: ComprobanteStorageService,
    private readonly retry: ArchivoRetryService,
  ) {}

  async create(
    archivo: ArchivoSubido,
    origen: ComprobanteOrigen,
    manager: EntityManager,
  ): Promise<ArchivoComprobante> {
    const path = await this.storage.upload(archivo, origen);
    const repository = manager.getRepository(ArchivoComprobante);

    try {
      return await repository.save(
        repository.create({
          nombre_original: archivo.originalname,
          path,
          mime_type: archivo.mimetype,
          size: archivo.size,
        }),
      );
    } catch (error) {
      await this.removeObject(path);
      throw error;
    }
  }

  async getSignedUrl(id: string): Promise<string> {
    const comprobante = await this.repository
      .createQueryBuilder('comprobante')
      .addSelect('comprobante.path')
      .where('comprobante.id = :id', { id })
      .andWhere('comprobante.deleted_at IS NULL')
      .getOne();

    if (!comprobante) {
      throw new NotFoundException('Comprobante no encontrado');
    }

    return this.storage.createSignedUrl(comprobante.path);
  }

  async removeObject(path: string): Promise<void> {
    await this.retry.compensate('eliminar comprobante de Supabase', () =>
      this.storage.remove(path),
    );
  }
}
