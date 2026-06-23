import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity('user')
export class User {
    
    @PrimaryGeneratedColumn("uuid")
    id_user!: string;

    @Column('text')
    name!: string;
}

