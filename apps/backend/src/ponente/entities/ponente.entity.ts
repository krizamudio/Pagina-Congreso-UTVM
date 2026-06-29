import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Ponente {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  usuario_id!: string;

  @Column({
    type: 'varchar',
    length: 200,
  })
  nombre!: string;

  @Column('uuid')
  archivo_foto_id!: string;

  @Column({
    type: 'varchar',
    length: 200,
  })
  institucion!: string;

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
}
