import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Ponente } from '../../ponente/entities/ponente.entity';
import { PonenteTipo } from '../../ponente/enums/ponente-tipo.enum';
import { ReemplazarEvaluadoresDto } from '../dto/evaluadores.dto';
import { HackatonEvaluador } from '../entities/hackaton-evaluador.entity';
import { Hackaton } from '../entities/hackaton.entity';

@Injectable()
export class HackatonEvaluadoresService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Hackaton)
    private readonly hackatones: Repository<Hackaton>,
  ) {}

  async replace(hackatonId: string, dto: ReemplazarEvaluadoresDto) {
    await this.dataSource.transaction(async (manager) => {
      const hackaton = await manager
        .getRepository(Hackaton)
        .createQueryBuilder('h')
        .where('h.id = :hackatonId', { hackatonId })
        .setLock('pessimistic_write')
        .getOne();
      if (!hackaton) throw new NotFoundException('Hackatón no encontrado');
      const assignments = await manager.getRepository(HackatonEvaluador).find({
        where: { hackaton: { id: hackatonId } },
        relations: { ponente: true },
      });
      const desired = new Set(dto.ponente_ids);
      const blockedRemoval = assignments.find(
        (item) =>
          !desired.has(item.ponente.id) && item.reconocimiento_emitido_at,
      );
      if (blockedRemoval)
        throw new ConflictException(
          `El evaluador ${blockedRemoval.ponente.nombre} ya tiene un reconocimiento emitido`,
        );
      const ponentes = dto.ponente_ids.length
        ? await manager
            .getRepository(Ponente)
            .createQueryBuilder('p')
            .where('p.id IN (:...ids)', { ids: dto.ponente_ids })
            .getMany()
        : [];
      if (ponentes.length !== dto.ponente_ids.length)
        throw new NotFoundException('Uno o más evaluadores no existen');
      if (ponentes.some((p) => p.tipo !== PonenteTipo.EVALUADOR))
        throw new BadRequestException(
          'Solo pueden asignarse ponentes de tipo Evaluador',
        );
      for (const current of assignments.filter(
        (item) => !desired.has(item.ponente.id),
      ))
        await manager.getRepository(HackatonEvaluador).softRemove(current);
      const existing = new Set(assignments.map((item) => item.ponente.id));
      for (const ponente of ponentes.filter((item) => !existing.has(item.id)))
        await manager
          .getRepository(HackatonEvaluador)
          .save({ hackaton, ponente });
    });
    return this.hackatones.findOne({
      where: { id: hackatonId },
      relations: { evaluadores: { ponente: true } },
    });
  }
}
