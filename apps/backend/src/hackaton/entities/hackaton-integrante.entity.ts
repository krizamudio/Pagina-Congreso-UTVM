import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ParticipanteAcceso } from '../../participante-acceso/entities/participante-acceso.entity';
import { Hackaton } from './hackaton.entity';
import { HackatonEquipo } from './hackaton-equipo.entity';

@Entity('hackaton_integrante')
@Index('uq_hackaton_participante_activo', ['hackaton', 'participante'], {
  unique: true,
  where: 'deleted_at IS NULL',
})
export class HackatonIntegrante {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @ManyToOne(() => Hackaton, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hackaton_id' })
  hackaton!: Hackaton;
  @ManyToOne(() => HackatonEquipo, (item) => item.integrantes, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'equipo_id' })
  equipo!: HackatonEquipo;
  @ManyToOne(() => ParticipanteAcceso, {
    nullable: false,
    onDelete: 'RESTRICT',
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
