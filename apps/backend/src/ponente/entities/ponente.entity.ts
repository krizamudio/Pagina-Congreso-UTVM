import { Column, Entity, PrimaryGeneratedColumn, DeleteDateColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Ponente {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  usuario_id!: string;

  @Column({
    type: 'varchar',
    length: 200,
  })
  nombre!: string;

  @Column('uuid')
  archivo_foto_id!: string;

  @Column({
    type: 'varchar',
    length: 200,
  })
  institucion!: string;

  @Column('text')
  semblanza!: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  tema!: string;

  @Column('boolean', {
    default: true,
  })
  visible_publico?: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updated_at!: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deleted_at?: Date;
}
