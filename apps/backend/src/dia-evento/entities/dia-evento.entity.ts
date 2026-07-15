import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { Congreso } from '../../congreso/entities/congreso.entity';

@Entity('dia_evento')
@Unique('uq_dia_evento_congreso_fecha', ['congreso', 'fecha_evento'])
@Index('idx_dia_evento_fecha', ['fecha_evento'])
export class DiaEvento {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Congreso, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'congreso_id' })
  congreso!: Congreso;

  @Column({ type: 'date' })
  fecha_evento!: string;

  @Column({ type: 'varchar', length: 100 })
  etiqueta!: string;
}
