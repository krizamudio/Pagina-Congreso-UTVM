import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';

import { ArchivoMultimedia } from '../../archivo_multimedia/entities/archivo_multimedia.entity';
import {
  ArchivoMultimediaService,
  perteneceADestino,
} from '../../archivo_multimedia/services';
import { Banner } from '../entities/banner.entity';
import { Noticia } from '../entities/noticia.entity';
import { ImagenContenidoDestino } from '../enums/imagen-contenido-destino.enum';

@Injectable()
export class ContenidoArchivoService {
  constructor(
    private readonly archivos: ArchivoMultimediaService,
    @InjectRepository(Noticia)
    private readonly noticias: Repository<Noticia>,
    @InjectRepository(Banner)
    private readonly banners: Repository<Banner>,
  ) {}

  resolvePortada(
    id: string | null | undefined,
    currentId?: string,
  ): Promise<ArchivoMultimedia | null | undefined> {
    return this.resolve(id, ImagenContenidoDestino.NOTICIAS, currentId);
  }

  async resolveBanner(
    id: string,
    currentId?: string,
  ): Promise<ArchivoMultimedia> {
    const archivo = await this.resolve(
      id,
      ImagenContenidoDestino.BANNERS,
      currentId,
    );
    if (!archivo) throw new NotFoundException('La imagen indicada no existe');
    return archivo;
  }

  private async resolve(
    id: string | null | undefined,
    destino: ImagenContenidoDestino,
    currentId?: string,
  ): Promise<ArchivoMultimedia | null | undefined> {
    if (id === undefined) return undefined;
    if (id === null) return null;

    let archivo: ArchivoMultimedia;
    try {
      archivo = await this.archivos.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('La imagen indicada no existe');
      }
      throw error;
    }

    if (!perteneceADestino(archivo, 'imagenes', destino)) {
      throw new NotFoundException('La imagen indicada no existe');
    }
    await this.ensureAvailable(id, destino, currentId);
    return archivo;
  }

  private async ensureAvailable(
    id: string,
    destino: ImagenContenidoDestino,
    currentId?: string,
  ): Promise<void> {
    const used =
      destino === ImagenContenidoDestino.NOTICIAS
        ? await this.noticias.exists({
            where: {
              portada: { id },
              ...(currentId ? { id: Not(currentId) } : {}),
            },
          })
        : await this.banners.exists({
            where: {
              imagen: { id },
              ...(currentId ? { id: Not(currentId) } : {}),
            },
          });

    if (used) {
      throw new ConflictException(
        'La imagen indicada ya está asignada a otro registro',
      );
    }
  }
}
