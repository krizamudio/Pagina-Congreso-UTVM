import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('externos')
export class Externo {

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  nombre!: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  apellidoPaterno!: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  apellidoMaterno!: string;

  @Column({
    type: 'varchar',
    length: 150,
    unique: true,
  })
  correo!: string;

  @Column({
    type: 'varchar',
    length: 20,
  })
  telefono!: string;

  @Column({
    type: 'varchar',
    length: 150,
  })
  institucion!: string;

  @Column('simple-array')
  dias!: string[];

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  total!: number;

  @Column({
    type: 'varchar',
    length: 255,
  })
  comprobante!: string;

  @Column({
    type: 'boolean',
    default: true,
  })
  correoVerificado!: boolean;

  @Column({
    type: 'varchar',
    length: 30,
    default: 'pendiente',
  })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}