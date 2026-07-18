import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Conferencia } from '../../conferencia/entities/conferencia.entity';
import { Taller } from '../../taller/entities/taller.entity';
import { ForoEmpresarial } from '../../foro-empresarial/entities/foro-empresarial.entity';

@Entity()
export class Ubicacion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: 150,
    unique: true,
  })
  nombre!: string;

  @Column('int')
  capacidad!: number;

  //TODO: Analizar si esta relacion realmente vale la pena
  //   @ManyToOne(() => Congreso, (congreso) => congreso.ubicaciones, {
  //     nullable: true,
  //     onDelete: 'SET NULL',
  //   })
  //   @JoinColumn({ name: 'congreso_id' })
  //   congreso?: Congreso;

  //Cosas de fechas automaticas
  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
  })
  created_at!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
  })
  updated_at!: Date;

  //Relaciones
  @OneToMany(() => Conferencia, (conf) => conf.ubicacion)
  conferencias?: Conferencia[];

  @OneToMany(() => Taller, (t) => t.ubicacion)
  talleres?: Taller[];

  @OneToMany(() => ForoEmpresarial, (foro) => foro.ubicacion)
  foros_empresariales?: ForoEmpresarial[];
}
