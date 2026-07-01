import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateArchivoMultimediaDto } from './dto/create-archivo_multimedia.dto';
import { UpdateArchivoMultimediaDto } from './dto/update-archivo_multimedia.dto';
import { GeneradorCommon } from '../../common/generador.common';
import { SupabaseService } from './supabase.service';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class ArchivoMultimediaService {
  private readonly supabase: SupabaseClient;
  private readonly bucket: string;

  constructor(private readonly generador: GeneradorCommon) {
    this.supabase = SupabaseService();
    this.bucket = process.env.SUPABASE_BUCKET ?? 'congreso-imagenes';
  }

  async uploadPhoto(foto: Express.Multer.File) {
    if (!foto) {
      throw new BadRequestException('Debes enviar una foto');
    }

    const extension = this.obtenerExtension(foto.originalname, foto.mimetype);
    const nombreArchivo = `${this.generador.CadenasAleatorias()}.${extension}`;
    const destino = `imagenes/${nombreArchivo}`;

    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .upload(destino, foto.buffer, {
        contentType: foto.mimetype,
        upsert: false,
      });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    const { data: publicUrlData } = this.supabase.storage
      .from(this.bucket)
      .getPublicUrl(data.path);

    return {
      path: data.path,
      url: publicUrlData.publicUrl,
      originalName: foto.originalname,
      mimetype: foto.mimetype,
      size: foto.size,
    };
  }

  private obtenerExtension(nombreArchivo: string, mimetype: string): string {
    const extension = nombreArchivo.split('.').pop();

    if (extension && extension !== nombreArchivo) {
      return extension.toLowerCase();
    }

    const extensionesPorMimeType: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    };

    return extensionesPorMimeType[mimetype] ?? 'jpg';
  }

  create(createArchivoMultimediaDto: CreateArchivoMultimediaDto) {
    return 'This action adds a new archivoMultimedia';
  }

  findAll() {
    return `This action returns all archivoMultimedia`;
  }

  findOne(id: number) {
    return `This action returns a #${id} archivoMultimedia`;
  }

  update(id: number, updateArchivoMultimediaDto: UpdateArchivoMultimediaDto) {
    return `This action updates a #${id} archivoMultimedia`;
  }

  remove(id: number) {
    return `This action removes a #${id} archivoMultimedia`;
  }
}
