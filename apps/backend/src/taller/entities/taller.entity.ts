import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Ponente } from '../../ponente/entities/ponente.entity';
import { Congreso } from '../../congreso/entities/congreso.entity';
import { Ubicacion } from '../../ubicacion/entities/ubicacion.entity';
import { InscripcionTaller } from '../../inscripcion-taller/entities/inscripcion-taller.entity';

@Entity()
export class Taller {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: 200,
  })
  titulo!: string;

  @Column('text')
  descripcion!: string;

  @Column('int')
  cupo_maximo!: number;

  @Column('date')
  fecha!: Date;

  @Column('time')
  hora_inicio!: string;

  @Column('time')
  hora_fin!: string;

  @Column('text')
  requisitos!: string;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
    nullable: true,
  })
  updated_at?: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deleted_at?: Date;

  //Relaciones
  @ManyToOne(() => Ponente, (p) => p.talleres, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'ponente_id' })
  ponente?: Ponente;

  @ManyToOne(() => Congreso, (cong) => cong.talleres, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'congreso_id',
  })
  congreso?: Congreso;

  @ManyToOne(() => Ubicacion, (u) => u.talleres, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'ubicacion_id',
  })
  ubicacion?: Ubicacion;
  @OneToMany(() => InscripcionTaller, (inscripcion) => inscripcion.taller)
  inscripciones!: InscripcionTaller[];
}
