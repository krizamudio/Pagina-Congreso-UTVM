import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { ParticipanteAcceso } from '../../participante-acceso/entities/participante-acceso.entity';
import { ParticipanteResolverService } from '../../participante-acceso/participante-resolver.service';
import { CreateEquipoDto, UpdateEquipoDto } from '../dto/equipo.dto';
import { AsignarResultadoDto } from '../dto/resultado.dto';
import { HackatonEquipo } from '../entities/hackaton-equipo.entity';
import { HackatonIntegrante } from '../entities/hackaton-integrante.entity';
import { Hackaton } from '../entities/hackaton.entity';
import { HackatonResultado } from '../enums/hackaton-resultado.enum';

@Injectable()
export class HackatonEquiposService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly resolver: ParticipanteResolverService,
  ) {}
  async create(hackatonId: string, dto: CreateEquipoDto) {
    const id = await this.dataSource.transaction((manager) =>
      this.save(manager, hackatonId, dto),
    );
    return this.findOne(hackatonId, id);
  }
  async update(hackatonId: string, equipoId: string, dto: UpdateEquipoDto) {
    await this.dataSource.transaction(async (manager) => {
      const equipo = await this.lockTeam(manager, hackatonId, equipoId);
      this.assertUnlocked(equipo);
      await manager
        .getRepository(HackatonIntegrante)
        .softDelete({ equipo: { id: equipoId } });
      await this.apply(manager, equipo.hackaton, equipo, dto);
    });
    return this.findOne(hackatonId, equipoId);
  }
  async findAll(hackatonId: string) {
    await this.requireHackaton(this.dataSource.manager, hackatonId);
    const equipos = await this.dataSource.getRepository(HackatonEquipo).find({
      where: { hackaton: { id: hackatonId } },
      relations: { integrantes: { participante: true } },
      order: { nombre: 'ASC' },
    });
    return Promise.all(equipos.map((item) => this.present(item)));
  }
  async findOne(hackatonId: string, equipoId: string) {
    const item = await this.dataSource.getRepository(HackatonEquipo).findOne({
      where: { id: equipoId, hackaton: { id: hackatonId } },
      relations: { hackaton: true, integrantes: { participante: true } },
    });
    if (!item) throw new NotFoundException('Equipo no encontrado');
    return this.present(item);
  }
  async remove(hackatonId: string, equipoId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const team = await this.lockTeam(manager, hackatonId, equipoId);
      this.assertUnlocked(team);
      await manager
        .getRepository(HackatonIntegrante)
        .softDelete({ equipo: { id: equipoId } });
      await manager.getRepository(HackatonEquipo).softRemove(team);
    });
  }
  async assignResult(
    hackatonId: string,
    equipoId: string,
    dto: AsignarResultadoDto,
  ) {
    await this.dataSource.transaction(async (manager) => {
      const team = await this.lockTeam(manager, hackatonId, equipoId);
      this.assertUnlocked(team);
      if (
        dto.resultado &&
        dto.resultado !== HackatonResultado.MENCION_HONORIFICA
      ) {
        const occupied = await manager
          .getRepository(HackatonEquipo)
          .createQueryBuilder('e')
          .where(
            'e.hackaton_id = :hackatonId AND e.resultado = :resultado AND e.id <> :equipoId',
            { hackatonId, resultado: dto.resultado, equipoId },
          )
          .setLock('pessimistic_write')
          .getOne();
        if (occupied)
          throw new ConflictException('Ese lugar del podio ya está asignado');
      }
      team.resultado = dto.resultado;
      await manager.getRepository(HackatonEquipo).save(team);
    });
    return this.findOne(hackatonId, equipoId);
  }
  private async save(
    manager: EntityManager,
    hackatonId: string,
    dto: CreateEquipoDto,
  ): Promise<string> {
    const hackaton = await this.requireHackaton(manager, hackatonId);
    const equipo = manager.getRepository(HackatonEquipo).create({ hackaton });
    try {
      await this.apply(manager, hackaton, equipo, dto);
      return equipo.id;
    } catch (error) {
      if ((error as { code?: string }).code === '23505')
        throw new ConflictException(
          'El nombre o uno de los integrantes ya pertenece a otro equipo',
        );
      throw error;
    }
  }
  private async apply(
    manager: EntityManager,
    hackaton: Hackaton,
    equipo: HackatonEquipo,
    dto: CreateEquipoDto,
  ): Promise<void> {
    const participants = await manager
      .getRepository(ParticipanteAcceso)
      .createQueryBuilder('p')
      .innerJoinAndSelect('p.congreso', 'c')
      .where('p.id IN (:...ids)', { ids: dto.participante_ids })
      .setLock('pessimistic_write', undefined, ['p'])
      .getMany();
    if (participants.length !== dto.participante_ids.length)
      throw new NotFoundException('Uno o más participantes no existen');
    if (participants.some((p) => p.congreso.id !== hackaton.congreso.id))
      throw new ConflictException(
        'Todos los participantes deben pertenecer al mismo congreso',
      );
    try {
      await Promise.all(
        participants.map((p) =>
          this.resolver.resolve(p.tipo, p.referencia_id, manager),
        ),
      );
    } catch {
      throw new BadRequestException(
        'Todos los integrantes deben ser participantes validados',
      );
    }
    equipo.nombre = dto.nombre;
    equipo.nombre_normalizado = dto.nombre.trim().toLocaleLowerCase('es-MX');
    await manager.getRepository(HackatonEquipo).save(equipo);
    await manager.getRepository(HackatonIntegrante).save(
      participants.map((participante) => ({
        hackaton,
        equipo,
        participante,
      })),
    );
  }
  private async requireHackaton(
    manager: EntityManager,
    id: string,
  ): Promise<Hackaton> {
    const item = await manager
      .getRepository(Hackaton)
      .findOne({ where: { id }, relations: { congreso: true } });
    if (!item) throw new NotFoundException('Hackatón no encontrado');
    return item;
  }
  private async lockTeam(
    manager: EntityManager,
    hackatonId: string,
    equipoId: string,
  ): Promise<HackatonEquipo> {
    const team = await manager
      .getRepository(HackatonEquipo)
      .createQueryBuilder('e')
      .innerJoinAndSelect('e.hackaton', 'h')
      .where('e.id = :equipoId AND h.id = :hackatonId', {
        equipoId,
        hackatonId,
      })
      .setLock('pessimistic_write')
      .getOne();
    if (!team) throw new NotFoundException('Equipo no encontrado');
    return team;
  }
  private assertUnlocked(team: HackatonEquipo): void {
    if (team.reconocimientos_emitidos_at)
      throw new ConflictException(
        'El equipo está bloqueado porque sus reconocimientos ya fueron emitidos',
      );
  }
  private async present(team: HackatonEquipo) {
    return {
      id: team.id,
      nombre: team.nombre,
      resultado: team.resultado ?? null,
      bloqueado: Boolean(team.reconocimientos_emitidos_at),
      integrantes: await Promise.all(
        (team.integrantes ?? []).map(async (i) => {
          const p = await this.resolver.resolve(
            i.participante.tipo,
            i.participante.referencia_id,
          );
          return {
            id: i.id,
            participante_acceso_id: i.participante.id,
            tipo: i.participante.tipo,
            nombre: p.nombreCompleto,
            correo: p.correo,
          };
        }),
      ),
    };
  }
}
