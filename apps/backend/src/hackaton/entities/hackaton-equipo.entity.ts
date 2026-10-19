import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { HackatonResultado } from '../enums/hackaton-resultado.enum';
import { Hackaton } from './hackaton.entity';
import { HackatonIntegrante } from './hackaton-integrante.entity';

@Entity('hackaton_equipo')
@Index('uq_hackaton_equipo_nombre_activo', ['hackaton', 'nombre_normalizado'], {
  unique: true,
  where: 'deleted_at IS NULL',
})
@Index('uq_hackaton_podio_activo', ['hackaton', 'resultado'], {
  unique: true,
  where:
    "deleted_at IS NULL AND resultado IN ('PRIMER_LUGAR','SEGUNDO_LUGAR','TERCER_LUGAR')",
})
export class HackatonEquipo {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @ManyToOne(() => Hackaton, (item) => item.equipos, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'hackaton_id' })
  hackaton!: Hackaton;
  @Column({ type: 'varchar', length: 150 }) nombre!: string;
  @Column({ type: 'varchar', length: 150 }) nombre_normalizado!: string;
  @Column({ type: 'enum', enum: HackatonResultado, nullable: true })
  resultado?: HackatonResultado | null;
  @Column({ type: 'timestamp', nullable: true })
  reconocimientos_emitidos_at?: Date | null;
  @OneToMany(() => HackatonIntegrante, (item) => item.equipo, { cascade: true })
  integrantes!: HackatonIntegrante[];
  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at!: Date;
  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updated_at!: Date;
  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deleted_at?: Date;
}
