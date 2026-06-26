import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Conferencia {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    //TODO: FK
    @Column('uuid')
    congreso_id!: string;

    @Column({type: 'varchar', length: 200})
    titulo!: string;

    //TODO: FK
    @Column('uuid')
    ponente_id!: string;

    @Column('text')
    resumen!: string;

    @Column('date')
    fecha!: Date;

    @Column('time')
    hora_inicio!: string;

    @Column('time')
    hora_fin!: string;

    //TODO: FK
    @Column('uuid')
    ubicacion_id!: string;
}
