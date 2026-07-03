import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

  @CreateDateColumn({ type: 'timestamp' })
  fecha_creacion!: Date;
}
