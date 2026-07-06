import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { ParticipanteNsu } from './participante-nsu.entity';
import { ArchivoComprobante } from './archivo-comprobante.entity';

@Entity('registro_nsu')
export class RegistroNsu {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  total_general!: number;

  @Column({ type: 'int', default: 0 })
  total_participantes!: number;

  @Column({ type: 'varchar', length: 30, default: 'PENDIENTE' })
  estado_pago!: string;

  @OneToMany(() => ParticipanteNsu, (participante) => participante.registro, {
    cascade: true,
  })
  participantes!: ParticipanteNsu[];

  @ManyToOne(() => ArchivoComprobante, { nullable: true })
  comprobante!: ArchivoComprobante | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
