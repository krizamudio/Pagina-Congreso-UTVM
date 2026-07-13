import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('ems')
export class Ems {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  nombres!: string;

  @Column({ length: 100 })
  apellidoPaterno!: string;

  @Column({ length: 100, nullable: true })
  apellidoMaterno!: string;

  @Column({
    unique: true,
    length: 150,
  })
  correo!: string;

  @Column({ type: 'varchar',length: 150, nullable: true })
  correo_original!: string | null;

  @Column({ length: 150 })
  institucion!: string;

  @Column({ length: 100 })
  carrera!: string;

  @Column({ length: 15 })
  telefono!: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updated_at!: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deleted_at?: Date;
}
