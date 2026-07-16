import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('archivo_comprobante')
export class ArchivoComprobante {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  nombre_original!: string;

  @Column({ type: 'varchar', length: 255 })
  nombre_guardado!: string;

  @Column({ type: 'varchar', length: 500 })
  ruta!: string;

  @Column({ type: 'varchar', length: 100 })
  mime_type!: string;

  @Column({ type: 'int' })
  size!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deleted_at?: Date;
}
