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
import { Ubicacion } from '../../ubicacion/entities/ubicacion.entity';

@Entity('foro_empresarial')
export class ForoEmpresarial {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 200 })
  nombre!: string;

  @Column({ type: 'varchar', length: 255 })
  direccion!: string;

  @Column({ type: 'text' })
  resena!: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updated_at!: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deleted_at!: Date | null;

  @ManyToOne(() => Congreso, (congreso) => congreso.foros_empresariales, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'congreso_id' })
  congreso!: Congreso;

  @ManyToOne(() => Ubicacion, (ubicacion) => ubicacion.foros_empresariales, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'ubicacion_id' })
  ubicacion!: Ubicacion;

  @OneToOne(() => ArchivoMultimedia, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'archivo_logo_id' })
  logo!: ArchivoMultimedia | null;
}
