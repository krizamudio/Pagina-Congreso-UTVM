import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ArchivoMultimedia } from '../../archivo_multimedia/entities/archivo_multimedia.entity';
import { Congreso } from '../../congreso/entities/congreso.entity';

@Entity('banner')
export class Banner {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  titulo!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  url_enlace!: string | null;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  @Column({ type: 'int', default: 0 })
  orden!: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updated_at!: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deleted_at!: Date | null;

  @ManyToOne(() => Congreso, (congreso) => congreso.banners, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'congreso_id' })
  congreso!: Congreso;

  @OneToOne(() => ArchivoMultimedia, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'archivo_multimedia_id' })
  imagen!: ArchivoMultimedia | null;
}
