import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Ponente } from '../../ponente/entities/ponente.entity';
import { Hackaton } from './hackaton.entity';

@Entity('hackaton_evaluador')
@Index('uq_hackaton_evaluador_activo', ['hackaton', 'ponente'], {
  unique: true,
  where: 'deleted_at IS NULL',
})
export class HackatonEvaluador {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @ManyToOne(() => Hackaton, (item) => item.evaluadores, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'hackaton_id' })
  hackaton!: Hackaton;
  @ManyToOne(() => Ponente, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'ponente_id' })
  ponente!: Ponente;
  @Column({ type: 'timestamp', nullable: true })
  reconocimiento_emitido_at?: Date | null;
  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at!: Date;
  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updated_at!: Date;
  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deleted_at?: Date;
}
