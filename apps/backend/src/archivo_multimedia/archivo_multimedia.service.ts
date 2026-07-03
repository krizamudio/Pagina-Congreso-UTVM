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
import { Repository } from 'typeorm';
import { ArchivoMultimedia } from './entities/archivo_multimedia.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IFoto } from './interfaces';

@Injectable()
export class ArchivoMultimediaService {
  private readonly supabase: SupabaseClient;
  private readonly bucket: string;

  constructor(
    private readonly generador: GeneradorCommon,
    @InjectRepository(ArchivoMultimedia)
    private readonly archivoMimeRepository: Repository<ArchivoMultimedia>,
  ) {
    this.supabase = SupabaseService();
    this.bucket = process.env.SUPABASE_BUCKET ?? 'congreso-imagenes';
  }

  async uploadPhoto(foto: Express.Multer.File): Promise<IFoto> {
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

    const DatosFoto: IFoto = {
      path: data.path,
      url: publicUrlData.publicUrl,
      originalName: foto.originalname,
      mimetype: foto.mimetype,
      size: foto.size,
    };

    await this.create(DatosFoto);

    return DatosFoto;
  }

  async create(datos: IFoto): Promise<void> {
    const uuidUser = 'e0efb875-4dc6-449b-8f45-832a728f2757';

    const archivoMimeDB = this.archivoMimeRepository.create({
      ruta_archivo: datos.url,
      tipo_mime: datos.mimetype,
      subido_por_usuario_id: uuidUser,
    });

    try {
      await this.archivoMimeRepository.save(archivoMimeDB);
    } catch (err) {
      throw new InternalServerErrorException('Ocurrio algo inseperado...'+err);
    }
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
}
