import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { extname, join } from 'path';
import { Repository } from 'typeorm';
import { CreateRegistroNsuDto } from './dto/create-registro-nsu.dto';
import { ArchivoComprobante } from './entities/archivo-comprobante.entity';
import { ParticipanteNsu } from './entities/participante-nsu.entity';
import { RegistroNsu } from './entities/registro-nsu.entity';

@Injectable()
export class RegistroNsuService {
  constructor(
    @Inject('REGISTRO_NSU_REPOSITORY')
    private readonly registroRepository: Repository<RegistroNsu>,

    @Inject('PARTICIPANTE_NSU_REPOSITORY')
    private readonly participanteRepository: Repository<ParticipanteNsu>,

    @Inject('ARCHIVO_COMPROBANTE_REPOSITORY')
    private readonly archivoRepository: Repository<ArchivoComprobante>,
  ) {}

  async create(createRegistroNsuDto: CreateRegistroNsuDto) {
    const participantesDto = createRegistroNsuDto.participantes ?? [];

    if (participantesDto.length === 0) {
      throw new BadRequestException('Debe registrar al menos un participante.');
    }

    if (!createRegistroNsuDto.comprobante) {
      throw new BadRequestException('El comprobante de pago es obligatorio.');
    }

    const uploadDir = join(process.cwd(), 'uploads', 'comprobantes');

    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    const extension = extname(createRegistroNsuDto.comprobante.originalname);
    const nombreGuardado = `${randomUUID()}${extension}`;
    const rutaArchivo = join(uploadDir, nombreGuardado);

    writeFileSync(rutaArchivo, createRegistroNsuDto.comprobante.buffer);

    const archivo = this.archivoRepository.create({
      nombre_original: createRegistroNsuDto.comprobante.originalname,
      nombre_guardado: nombreGuardado,
      ruta: rutaArchivo,
      mime_type: createRegistroNsuDto.comprobante.mimetype,
      size: createRegistroNsuDto.comprobante.size,
    });

    const archivoGuardado = await this.archivoRepository.save(archivo);

    const totalGeneral = participantesDto.reduce((total, participante) => {
      return total + Number(participante.montoNumero || 0);
    }, 0);

    const registro = this.registroRepository.create({
      total_general: totalGeneral,
      total_participantes: participantesDto.length,
      estado_pago: 'PENDIENTE',
      comprobante: archivoGuardado,
    });

    const registroGuardado = await this.registroRepository.save(registro);

    const participantes = participantesDto.map((participante, index) => {
      return this.participanteRepository.create({
        registro: registroGuardado,
        es_tutor: index === 0,
        nombre_completo: participante.nombreCompleto,
        correo: participante.correo,
        institucion: participante.institucion,
        carrera: participante.carrera,
        telefono: participante.telefono,
        dias: participante.dias,
        monto_individual: participante.montoNumero,
      });
    });

    await this.participanteRepository.save(participantes);

    return this.findOne(registroGuardado.id);
  }

  async findAll() {
    return this.registroRepository.find({
      relations: {
        participantes: true,
        comprobante: true,
      },
      order: {
        created_at: 'DESC',
      },
    });
  }

  async findOne(id: string) {
    return this.registroRepository.findOne({
      where: { id },
      relations: {
        participantes: true,
        comprobante: true,
      },
    });
  }
}
