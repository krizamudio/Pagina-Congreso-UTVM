import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { Conferencia } from '../../conferencia/entities/conferencia.entity';
import { Congreso } from '../../congreso/entities/congreso.entity';
import { ParticipanteAcceso } from '../../participante-acceso/entities/participante-acceso.entity';
import { Ponente } from '../../ponente/entities/ponente.entity';
import { Taller } from '../../taller/entities/taller.entity';
import { Hackaton } from '../../hackaton/entities/hackaton.entity';
import { HackatonEquipo } from '../../hackaton/entities/hackaton-equipo.entity';
import { ReconocimientoEstado } from '../enums/reconocimiento-estado.enum';
import { ReconocimientoTipo } from '../enums/reconocimiento-tipo.enum';

@Entity('reconocimiento')
@Unique('uq_reconocimiento_clave_emision', ['clave_emision'])
export class Reconocimiento {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 220 })
  clave_emision!: string;

  @ManyToOne(() => Congreso, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'congreso_id' })
  congreso!: Congreso;

  @ManyToOne(() => Taller, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taller_id' })
  taller?: Taller | null;

  @ManyToOne(() => Conferencia, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conferencia_id' })
  conferencia?: Conferencia | null;

  @ManyToOne(() => Hackaton, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hackaton_id' })
  hackaton?: Hackaton | null;

  @ManyToOne(() => HackatonEquipo, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hackaton_equipo_id' })
  hackaton_equipo?: HackatonEquipo | null;

  @ManyToOne(() => ParticipanteAcceso, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'participante_id' })
  participante?: ParticipanteAcceso | null;

  @ManyToOne(() => Ponente, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'ponente_id' })
  ponente?: Ponente | null;

  @Column({ type: 'enum', enum: ReconocimientoTipo })
  tipo!: ReconocimientoTipo;

  @Column({ type: 'varchar', length: 250 })
  nombre_destinatario!: string;

  @Column({
    type: 'enum',
    enum: ReconocimientoEstado,
    default: ReconocimientoEstado.PENDIENTE,
  })
  estado!: ReconocimientoEstado;

  @Column({ type: 'int', default: 0 })
  intentos!: number;

  @Column({ type: 'timestamp', nullable: true })
  primera_fecha_emision?: Date | null;

  @Column({ type: 'text', nullable: true, select: false })
  ultimo_error?: string | null;

  @Column({ type: 'char', length: 64, nullable: true })
  ultimo_pdf_sha256?: string | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updated_at!: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deleted_at?: Date;
}
