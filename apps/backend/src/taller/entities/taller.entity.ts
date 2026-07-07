import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('taller')
export class Taller {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  congreso_id!: string;

  @Column({
    type: 'varchar',
    length: 200,
  })
  titulo!: string;

  @Column('text')
  descripcion!: string;

  @Column('uuid')
  tallerista_id!: string;

  @Column('int')
  cupo_maximo!: number;

  @Column({
    type: 'int',
    default: 0,
  })
  inscritos!: number;

  @Column('date')
  fecha!: Date;

  @Column('time')
  hora_inicio!: string;

  @Column('time')
  hora_fin!: string;

  @Column('uuid')
  ubicacion_id!: string;

  @Column('text')
  requisitos!: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  imagen_url?: string | null;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'fecha_creacion',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fecha_creacion!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'fecha_actualizacion',
    nullable: true,
  })
  fecha_actualizacion?: Date;
}
