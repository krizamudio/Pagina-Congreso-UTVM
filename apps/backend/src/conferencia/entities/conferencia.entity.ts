import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Congreso } from '../../congreso/entities/congreso.entity';
import { Ubicacion } from '../../ubicacion/entities/ubicacion.entity';
import { Ponente } from '../../ponente/entities/ponente.entity';

@Entity()
export class Conferencia {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 200 })
  titulo!: string;

  @Column('text')
  resumen!: string;

  @Column('date')
  fecha!: Date;

  @Column('time')
  hora_inicio!: string;

  @Column('time')
  hora_fin!: string;


  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updated_at!: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deleted_at?: Date;

  //Relaciones
  @ManyToOne(() => Congreso, (congreso) => congreso.conferencias)
  @JoinColumn({ name: 'congreso_id' })
  congreso!: Congreso;

  @ManyToOne(() => Ubicacion, (ubi) => ubi.conferencias)
  @JoinColumn({name: 'ubicacion_id'})
  ubicacion!: Ubicacion;

  @ManyToOne(() => Ponente, (p) => p.conferencias)
  @JoinColumn({
    name: 'ponente_id'
  })
  ponente!: Ponente;
}
