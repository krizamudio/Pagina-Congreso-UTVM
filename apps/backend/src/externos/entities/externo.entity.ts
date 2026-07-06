import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { ArchivoComprobante } from '../../registro-nsu/entities/archivo-comprobante.entity';

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
  apellidoMaterno!: string | null;

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
    nullable: true,
  })
  institucion!: string | null;

  @Column('simple-array')
  dias!: string[];

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  total!: number;

  @ManyToOne(() => ArchivoComprobante, {
    nullable: true,
  })
  @JoinColumn({
    name: 'comprobanteId',
  })
  comprobante!: ArchivoComprobante | null;

  @Column({
    type: 'boolean',
    default: false,
  })
  correoVerificado!: boolean;

  @Column({
    type: 'varchar',
    length: 30,
    default: 'pendiente_verificacion',
  })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}