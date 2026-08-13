import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParticipanteAcceso } from '../../participante-acceso/entities/participante-acceso.entity';
import { ParticipanteResolverService } from '../../participante-acceso/participante-resolver.service';
import { FindElegiblesDto } from '../dto/find-elegibles.dto';
import { Hackaton } from '../entities/hackaton.entity';

@Injectable()
export class HackatonElegiblesService {
  constructor(
    @InjectRepository(Hackaton)
    private readonly hackatones: Repository<Hackaton>,
    @InjectRepository(ParticipanteAcceso)
    private readonly participantes: Repository<ParticipanteAcceso>,
    private readonly resolver: ParticipanteResolverService,
  ) {}
  async find(hackatonId: string, query: FindElegiblesDto) {
    const hackaton = await this.hackatones.findOne({
      where: { id: hackatonId },
      relations: { congreso: true },
    });
    if (!hackaton) throw new NotFoundException('Hackatón no encontrado');
    const candidates = await this.participantes
      .createQueryBuilder('p')
      .innerJoinAndSelect('p.congreso', 'congreso')
      .leftJoin(
        'hackaton_integrante',
        'i',
        'i.participante_id = p.id AND i.hackaton_id = :hackatonId AND i.deleted_at IS NULL',
        { hackatonId },
      )
      .where('congreso.id = :congresoId', { congresoId: hackaton.congreso.id })
      .andWhere('i.id IS NULL')
      .orderBy('p.fecha_creacion', 'DESC')
      .getMany();
    const resolved = (
      await Promise.all(
        candidates.map(async (p) => {
          try {
            const person = await this.resolver.resolve(p.tipo, p.referencia_id);
            return {
              id: p.id,
              tipo: p.tipo,
              nombre: person.nombreCompleto,
              correo: person.correo,
            };
          } catch {
            return null;
          }
        }),
      )
    ).filter((item): item is NonNullable<typeof item> => item !== null);
    const term = query.buscar?.trim().toLocaleLowerCase('es-MX');
    const filtered = term
      ? resolved.filter((item) =>
          `${item.nombre} ${item.correo}`
            .toLocaleLowerCase('es-MX')
            .includes(term),
        )
      : resolved;
    const start = (query.page - 1) * query.limit;
    return {
      data: filtered.slice(start, start + query.limit),
      total: filtered.length,
      page: query.page,
      limit: query.limit,
    };
  }
}
