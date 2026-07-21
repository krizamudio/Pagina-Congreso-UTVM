import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { Taller } from '../../taller/entities/taller.entity';

export enum TipoParticipanteTaller {
  EXTERNO = 'EXTERNO',
  NSU = 'NSU',
}

@Entity('inscripcion_taller')
@Unique('UQ_PARTICIPANTE_UN_SOLO_TALLER', [
  'tipo_participante',
  'participante_id',
])
export class InscripcionTaller {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: 20,
  })
  tipo_participante!: TipoParticipanteTaller;

  @Column({
    type: 'uuid',
  })
  participante_id!: string;

  @ManyToOne(() => Taller, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'taller_id',
  })
  taller!: Taller;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
  })
  created_at!: Date;
}
