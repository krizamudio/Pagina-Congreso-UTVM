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
import { Congreso } from '../../congreso/entities/congreso.entity';
import { HackatonEquipo } from './hackaton-equipo.entity';
import { HackatonEvaluador } from './hackaton-evaluador.entity';

@Entity('hackaton')
@Index('uq_hackaton_congreso_activo', ['congreso'], {
  unique: true,
  where: 'deleted_at IS NULL',
})
export class Hackaton {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @ManyToOne(() => Congreso, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'congreso_id' })
  congreso!: Congreso;
  @Column({ type: 'varchar', length: 180 }) nombre!: string;
  @Column({ type: 'text' }) descripcion!: string;
  @Column({ type: 'date' }) fecha_inicio!: string;
  @Column({ type: 'date' }) fecha_fin!: string;
  @OneToMany(() => HackatonEvaluador, (item) => item.hackaton)
  evaluadores!: HackatonEvaluador[];
  @OneToMany(() => HackatonEquipo, (item) => item.hackaton)
  equipos!: HackatonEquipo[];
  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at!: Date;
  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updated_at!: Date;
  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deleted_at?: Date;
}
