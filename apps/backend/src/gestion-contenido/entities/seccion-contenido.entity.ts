import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Congreso } from '../../congreso/entities/congreso.entity';
import { ContenidoEstado } from '../enums/contenido-estado.enum';

@Entity('seccion_contenido')
@Index('UQ_seccion_congreso_clave_activa', ['congreso', 'clave_seccion'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
export class SeccionContenido {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  clave_seccion!: string;

  @Column({ type: 'varchar', length: 200 })
  titulo!: string;

  @Column({ type: 'text', nullable: true })
  cuerpo!: string | null;

  @Column({ type: 'varchar', length: 20, default: ContenidoEstado.BORRADOR })
  estado!: ContenidoEstado;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updated_at!: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deleted_at!: Date | null;

  @ManyToOne(() => Congreso, (congreso) => congreso.secciones_contenido, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'congreso_id' })
  congreso!: Congreso;
}
