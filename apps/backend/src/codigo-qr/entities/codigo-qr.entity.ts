import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('codigo_qr')
@Check('chk_codigo_qr_tipo', `"tipo" IN ('acceso')`)
export class CodigoQr {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('uq_codigo_qr_token_hash', { unique: true })
  @Column({ type: 'varchar', length: 255 })
  token_hash!: string;

  @Column({ type: 'varchar', length: 30 })
  tipo!: 'acceso';

  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'fecha_creacion' })
  fecha_creacion!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'fecha_actualizacion' })
  fecha_actualizacion!: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_expiracion!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  fecha_revocacion!: Date | null;

  @Column({ type: 'text', nullable: true })
  motivo_revocacion!: string | null;
}
