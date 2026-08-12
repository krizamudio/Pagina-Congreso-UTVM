import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('codigo_login')
export class CodigoLogin {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 150 })
  correo!: string;

  @Column({ type: 'varchar', length: 20 })
  tipo_participante!: string;

  @Column({ type: 'varchar', length: 100 })
  participante_id!: string;

  @Column({ type: 'varchar', length: 255 })
  codigo_hash!: string;

  @Column({ type: 'timestamp' })
  expira_en!: Date;

  @Column({ type: 'boolean', default: false })
  utilizado!: boolean;

  @Column({ type: 'int', default: 0 })
  intentos!: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updated_at!: Date;
}
