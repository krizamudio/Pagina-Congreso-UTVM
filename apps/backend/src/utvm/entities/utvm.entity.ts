import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('utvm')
export class Utvm {
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

  @Column()
  cuatrimestre!: number;

  @Column({ length: 10 })
  grupo!: string;

  @Column({ length: 15 })
  telefono!: string;
}
