import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DatabaseErrorHandlerService } from '../../common/database/handle-database-error';
import { ArchivoMultimedia } from '../entities/archivo_multimedia.entity';

export interface CrearArchivoData {
  subido_por_usuario_id: string;
  ruta_archivo: string;
  path: string;
  tipo_mime: string;
}

export type ActualizarArchivoData = Pick<
  CrearArchivoData,
  'ruta_archivo' | 'path' | 'tipo_mime'
>;

@Injectable()
export class ArchivoMultimediaService {
  constructor(
    @InjectRepository(ArchivoMultimedia)
    private readonly repository: Repository<ArchivoMultimedia>,
    private readonly dbErrors: DatabaseErrorHandlerService,
  ) {}

  async create(data: CrearArchivoData): Promise<string> {
    try {
      await this.repository.save(this.repository.create(data));
      return 'Archivo guardado correctamente';
    } catch (error) {
      this.dbErrors.handle(error);
    }
  }

  async findOne(id: string): Promise<ArchivoMultimedia> {
    const archivo = await this.repository.findOne({ where: { id } });

    if (!archivo) {
      throw new NotFoundException('Archivo no encontrado');
    }

    return archivo;
  }

  async update(
    id: string,
    data: ActualizarArchivoData,
  ): Promise<ArchivoMultimedia> {
    const archivo = await this.repository.preload({ id, ...data });

    if (!archivo) {
      throw new NotFoundException('Archivo no encontrado');
    }

    try {
      return await this.repository.save(archivo);
    } catch (error) {
      this.dbErrors.handle(error);
    }
  }

  async delete(registro: ArchivoMultimedia): Promise<void> {
    try {
      await this.repository.delete(registro.id);
    } catch (error) {
      this.dbErrors.handle(error);
    }
  }

  async restore(registro: ArchivoMultimedia): Promise<void> {
    try {
      await this.repository.save(this.repository.create(registro));
    } catch (error) {
      this.dbErrors.handle(error);
    }
  }
}
