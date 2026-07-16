import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { CodigoQr } from '../../codigo-qr/entities/codigo-qr.entity';
import { ParticipanteAcceso } from '../../participante-acceso/entities/participante-acceso.entity';

@Entity('qr_acceso')
export class QrAcceso {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => CodigoQr, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'codigo_qr_id' })
  codigo_qr!: CodigoQr;

  @OneToOne(() => ParticipanteAcceso, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'participante_id' })
  participante!: ParticipanteAcceso;

  @CreateDateColumn({ type: 'timestamp', name: 'fecha_creacion' })
  fecha_creacion!: Date;
}
