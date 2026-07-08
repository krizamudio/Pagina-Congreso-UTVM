import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTallerDto } from './dto/create-taller.dto';
import { UpdateTallerDto } from './dto/update-taller.dto';
import { Taller } from './entities/taller.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ValidadorCommon } from '../../common/validador.common';

type EstadoCupo = 'verde' | 'amarillo' | 'rojo' | 'gris';

@Injectable()
export class TallerService {
  constructor(
    @InjectRepository(Taller)
    private readonly tallerRepository: Repository<Taller>,
    private readonly validador: ValidadorCommon,
  ) {}

  async createTaller(createTallerDto: CreateTallerDto) {
    const { fecha, hora_fin, hora_inicio, inscritos, cupo_maximo } =
      createTallerDto;

    this.validador.FechaValida(fecha);
    this.validador.ValidarHoras(hora_fin, hora_inicio);

    this.validarCupo(inscritos ?? 0, cupo_maximo);

    const tallerCreado = this.tallerRepository.create({
      ...createTallerDto,
      inscritos: inscritos ?? 0,
    });

    try {
      const tallerGuardado = await this.tallerRepository.save(tallerCreado);
      return this.formatearTaller(tallerGuardado);
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async findAllTalleres() {
    const talleres = await this.tallerRepository.find({
      order: {
        fecha: 'ASC',
        hora_inicio: 'ASC',
      },
    });

    return talleres.map((taller) => this.formatearTaller(taller));
  }

  async findOneTaller(id: string) {
    const taller = await this.tallerRepository.findOneBy({ id });

    if (!taller) {
      throw new NotFoundException(
        `No se encontro ningun taller con el id ${id}`,
      );
    }

    return this.formatearTaller(taller);
  }

  async updateTaller(id: string, updateTallerDto: UpdateTallerDto) {
    const tallerActual = await this.tallerRepository.findOneBy({ id });

    if (!tallerActual) {
      throw new NotFoundException(
        `No se encontro ningun taller con el id ${id}`,
      );
    }

    const fechaFinal = updateTallerDto.fecha ?? tallerActual.fecha;
    const horaInicioFinal =
      updateTallerDto.hora_inicio ?? tallerActual.hora_inicio;
    const horaFinFinal = updateTallerDto.hora_fin ?? tallerActual.hora_fin;

    this.validador.FechaValida(fechaFinal as string);
    this.validador.ValidarHoras(horaFinFinal, horaInicioFinal);

    const inscritosFinal =
      updateTallerDto.inscritos ?? tallerActual.inscritos ?? 0;

    const cupoFinal = updateTallerDto.cupo_maximo ?? tallerActual.cupo_maximo;

    this.validarCupo(inscritosFinal, cupoFinal);

    const taller = await this.tallerRepository.preload({
      id,
      ...updateTallerDto,
    });

    if (!taller) {
      throw new NotFoundException(
        `No se encontro ningun taller con el id ${id}`,
      );
    }

    try {
      const tallerActualizado = await this.tallerRepository.save(taller);
      return this.formatearTaller(tallerActualizado);
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
  async uploadImagenTaller(id: string, file: Express.Multer.File) {
    const taller = await this.tallerRepository.findOneBy({ id });

    if (!taller) {
      throw new NotFoundException(
        `No se encontro ningun taller con el id ${id}`,
      );
    }

    if (!file) {
      throw new BadRequestException('Debe enviar una imagen.');
    }

    taller.imagen_url = `/uploads/talleres/${file.filename}`;

    try {
      const tallerActualizado = await this.tallerRepository.save(taller);
      return this.formatearTaller(tallerActualizado);
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async removeTaller(id: string) {
    const taller = await this.tallerRepository.findOneBy({ id });

    if (!taller) {
      throw new NotFoundException(
        `No se encontro ningun taller con el id ${id}`,
      );
    }

    try {
      await this.tallerRepository.delete(id);
      return this.formatearTaller(taller);
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  private validarCupo(inscritos: number, cupoMaximo: number): void {
    if (inscritos < 0) {
      throw new BadRequestException(
        'El número de inscritos no puede ser menor que 0.',
      );
    }

    if (inscritos > cupoMaximo) {
      throw new BadRequestException(
        'El número de inscritos no puede ser mayor que el cupo máximo.',
      );
    }
  }

  private calcularPorcentaje(inscritos: number, cupoMaximo: number): number {
    if (!cupoMaximo || cupoMaximo <= 0) {
      return 0;
    }

    return Math.round((inscritos / cupoMaximo) * 100);
  }

  private calcularEstadoCupo(
    inscritos: number,
    cupoMaximo: number,
  ): EstadoCupo {
    const porcentaje = this.calcularPorcentaje(inscritos, cupoMaximo);

    if (porcentaje >= 100) {
      return 'gris';
    }

    if (porcentaje >= 80) {
      return 'rojo';
    }

    if (porcentaje >= 50) {
      return 'amarillo';
    }

    return 'verde';
  }

  private formatearHorario(horaInicio: string, horaFin: string): string {
    return `${horaInicio} - ${horaFin}`;
  }

  private formatearTaller(taller: Taller) {
    const inscritos = taller.inscritos ?? 0;
    const porcentaje_ocupacion = this.calcularPorcentaje(
      inscritos,
      taller.cupo_maximo,
    );

    return {
      ...taller,
      horario: this.formatearHorario(taller.hora_inicio, taller.hora_fin),
      porcentaje_ocupacion,
      estado_cupo: this.calcularEstadoCupo(inscritos, taller.cupo_maximo),
      cupos_disponibles: taller.cupo_maximo - inscritos,
    };
  }
}
