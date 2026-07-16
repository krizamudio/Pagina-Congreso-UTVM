import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { Congreso } from '../../congreso/entities/congreso.entity';
import { ParticipanteTipo } from '../participante-tipo.enum';

@Entity('participante_acceso')
@Unique('uq_participante_acceso_origen', ['tipo', 'referencia_id', 'congreso'])
export class ParticipanteAcceso {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 20 })
  tipo!: ParticipanteTipo;

  @Column({ type: 'varchar', length: 64 })
  referencia_id!: string;

  @ManyToOne(() => Congreso, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'congreso_id' })
  congreso!: Congreso;

  @CreateDateColumn({ type: 'timestamp', name: 'fecha_creacion' })
  fecha_creacion!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'fecha_actualizacion' })
  fecha_actualizacion!: Date;
}
