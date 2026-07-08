import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Congreso } from '../../congreso/entities/congreso.entity';
import { Conferencia } from '../../conferencia/entities/conferencia.entity';
import { Taller } from '../../taller/entities/taller.entity';

@Entity()
export class Ubicacion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: 150,
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

  @OneToMany(() => Conferencia, (conf) => conf.ubicacion)
  conferencias?: Conferencia[];

  @OneToMany(() => Taller, (t) => t.ubicacion)
  talleres!: Taller[];
}
