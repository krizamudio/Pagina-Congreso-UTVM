import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity()
export class Taller {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  //TODO: FK
  @Column('uuid')
  congreso_id!: string;

  @Column({
    type: 'varchar',
    length: 200,
  })
  titulo!: string;

  @Column('text')
  descripcion!: string;

  //TODO: FK
  @Column('uuid')
  tallerista_id!: string;

  @Column('int')
  cupo_maximo!: number;

  @Column('date')
  fecha!: Date;

  @Column('time')
  hora_inicio!: string;

  @Column('time')
  hora_fin!: string;

  //TODO: FK
  @Column('uuid')
  ubicacion_id!: string;

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
}
