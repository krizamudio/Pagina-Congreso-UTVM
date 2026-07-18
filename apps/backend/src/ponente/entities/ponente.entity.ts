import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Conferencia } from '../../conferencia/entities/conferencia.entity';
import { Taller } from '../../taller/entities/taller.entity';
import { ArchivoMultimedia } from '../../archivo_multimedia/entities/archivo_multimedia.entity';
import { PonenteTipo } from '../enums/ponente-tipo.enum';

@Entity()
export class Ponente {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // TODO: relacionar con la entidad de usuario cuando el modulo este disponible.
  @Column('uuid')
  usuario_id!: string;

  @Column({
    type: 'varchar',
    length: 200,
  })
  nombre!: string;

  @Column({
    type: 'varchar',
    length: 200,
  })
  institucion!: string;

  @Column({
    type: 'enum',
    enum: PonenteTipo,
    default: PonenteTipo.PONENTE,
  })
  tipo!: PonenteTipo;

  @Column('text')
  semblanza!: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  tema!: string;

  @Column('boolean', {
    default: true,
  })
  visible_publico?: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updated_at!: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deleted_at?: Date;

  //Relaciones
  @OneToMany(() => Conferencia, (conf) => conf.ponente)
  conferencias!: Conferencia[];

  @OneToMany(() => Taller, (t) => t.ponente)
  talleres!: Taller[];

  @OneToOne(() => ArchivoMultimedia, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'archivo_foto_id' })
  foto?: ArchivoMultimedia | null;
}
