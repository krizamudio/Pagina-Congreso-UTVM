import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('ems')
export class Ems {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  nombres!: string;

  @Column({ length: 100 })
  apellidoPaterno!: string;

  @Column({ length: 100, nullable: true })
  apellidoMaterno!: string;

  @Column({
    unique: true,
    length: 150,
  })
  correo!: string;

  @Column({ length: 150 })
  institucion!: string;

  @Column({ length: 100 })
  carrera!: string;

  @Column({ length: 15 })
  telefono!: string;
}
