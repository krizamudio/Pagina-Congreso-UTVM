import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('archivo_comprobante')
export class ArchivoComprobante {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  nombre_original!: string;

  @Column({ type: 'varchar', length: 500, select: false })
  path!: string;

  @Column({ type: 'varchar', length: 100 })
  mime_type!: string;

  @Column({ type: 'int' })
  size!: number;

  @CreateDateColumn({ select: false })
  created_at!: Date;

  @UpdateDateColumn({ select: false })
  updated_at!: Date;

  @DeleteDateColumn({
    type: 'timestamp',
    name: 'deleted_at',
    nullable: true,
    select: false,
  })
  deleted_at?: Date;
}
