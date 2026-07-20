import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Entity,
} from 'typeorm';
import { Conferencia } from '../../conferencia/entities/conferencia.entity';
import { Taller } from '../../taller/entities/taller.entity';
import { ForoEmpresarial } from '../../foro-empresarial/entities/foro-empresarial.entity';
import { Banner } from '../../gestion-contenido/entities/banner.entity';
import { Noticia } from '../../gestion-contenido/entities/noticia.entity';
import { SeccionContenido } from '../../gestion-contenido/entities/seccion-contenido.entity';

@Entity()
export class Congreso {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: 150,
  })
  nombre!: string;

  @Column({
    type: 'varchar',
    length: 200,
  })
  eslogan!: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  ubicacion!: string;

  @Column('timestamp')
  fecha_inicio!: Date;

  @Column('timestamp')
  fecha_fin!: Date;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at', nullable: true })
  updated_at?: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deleted_at?: Date;

  @OneToMany(() => Conferencia, (conferencia) => conferencia.congreso)
  conferencias!: Conferencia[];

  // @OneToMany( () => Ubicacion, (ubicacion) => ubicacion.congreso)
  // ubicaciones!: Ubicacion[];

  @OneToMany(() => Taller, (t) => t.congreso)
  talleres!: Taller[];

  @OneToMany(() => ForoEmpresarial, (foro) => foro.congreso)
  foros_empresariales!: ForoEmpresarial[];

  @OneToMany(() => Noticia, (noticia) => noticia.congreso)
  noticias!: Noticia[];

  @OneToMany(() => SeccionContenido, (seccion) => seccion.congreso)
  secciones_contenido!: SeccionContenido[];

  @OneToMany(() => Banner, (banner) => banner.congreso)
  banners!: Banner[];
}
