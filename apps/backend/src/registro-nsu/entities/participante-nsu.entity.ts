import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RegistroNsu } from './registro-nsu.entity';

@Entity('participante_nsu')
export class ParticipanteNsu {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'boolean', default: false })
  es_tutor!: boolean;

  @Column({ type: 'varchar', length: 200 })
  nombre_completo!: string;

  @Column({ type: 'varchar', length: 150 })
  correo!: string;

  @Column({ type: 'varchar', length: 200 })
  institucion!: string;

  @Column({ type: 'varchar', length: 200 })
  carrera!: string;

  @Column({ type: 'varchar', length: 20 })
  telefono!: string;

  @Column({ type: 'varchar', length: 100 })
  dias!: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  monto_individual!: number;

  @ManyToOne(() => RegistroNsu, (registro) => registro.participantes, {
    onDelete: 'CASCADE',
  })
  registro!: RegistroNsu;
}
