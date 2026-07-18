import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ArchivoMultimedia } from '../../archivo_multimedia/entities/archivo_multimedia.entity';
import { Congreso } from '../../congreso/entities/congreso.entity';
import { ContenidoEstado } from '../enums/contenido-estado.enum';

@Entity('noticia')
@Index('UQ_noticia_slug_activo', ['slug'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
export class Noticia {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 200 })
  titulo!: string;

  @Column({ type: 'varchar', length: 220 })
  slug!: string;

  @Column({ type: 'text' })
  cuerpo!: string;

  @Column({ type: 'varchar', length: 20, default: ContenidoEstado.BORRADOR })
  estado!: ContenidoEstado;

  @Column({ type: 'timestamp', name: 'fecha_publicacion', nullable: true })
  fecha_publicacion!: Date | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updated_at!: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deleted_at!: Date | null;

  @ManyToOne(() => Congreso, (congreso) => congreso.noticias, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'congreso_id' })
  congreso!: Congreso;

  @OneToOne(() => ArchivoMultimedia, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'archivo_portada_id' })
  portada!: ArchivoMultimedia | null;
}
