import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { ParticipanteAcceso } from '../../participante-acceso/entities/participante-acceso.entity';
import { Taller } from './taller.entity';

@Entity('inscripcion_taller')
@Unique('uq_inscripcion_taller_participante_congreso', ['participante'])
export class InscripcionTaller {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Taller, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taller_id' })
  taller!: Taller;

  @ManyToOne(() => ParticipanteAcceso, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'participante_id' })
  participante!: ParticipanteAcceso;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updated_at!: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deleted_at?: Date;
}
