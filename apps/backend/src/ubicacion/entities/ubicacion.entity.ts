import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Congreso } from "../../congreso/entities/congreso.entity";
import { Conferencia } from "../../conferencia/entities/conferencia.entity";


@Entity()
export class Ubicacion {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({
        type: 'varchar',
        length: 150
    })
    nombre!: string;

    @Column('int')
    capacidad!: number;

    @ManyToOne(() => Congreso, (congreso) => congreso.ubicaciones)
    @JoinColumn({name: 'congreso_id'})
    congreso!: Congreso;

    @OneToMany(() => Conferencia, (conf) => conf.ubicacion)
    conferencias!: Conferencia[];

}
