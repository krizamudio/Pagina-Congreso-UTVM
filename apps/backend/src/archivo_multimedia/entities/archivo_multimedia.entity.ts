import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class ArchivoMultimedia {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  subido_por_usuario_id!: string;

  @Column('text')
  ruta_archivo!: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  tipo_mime!: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updated_at!: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deleted_at?: Date;
}
