import { Injectable } from '@nestjs/common';
import { CreateTallerDto } from '../dto/create-taller.dto';
import { UpdateTallerDto } from '../dto/update-taller.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Congreso } from '../../congreso/entities/congreso.entity';
import { Repository } from 'typeorm';
import { Ubicacion } from '../../ubicacion/entities/ubicacion.entity';
import { Ponente } from '../../ponente/entities/ponente.entity';

@Injectable()
export class TallerRelationsService {

    constructor(
        // @InjectRepository(Congreso)
        // private readonly congresoRepository: Repository<Congreso>,
        // @InjectRepository(Ubicacion)
        // private readonly ubicacionReadonly: Repository<Ubicacion>,
        // @InjectRepository(Ponente)
        // private readonly ponenteRepository: Repository<Ponente>,
    ){}

    //Vamos a usar el updateTallerDto porque es lo mismo que el create
    // pero con todos los datos en opcional
    async resolveCreateRelations ( tallerDto: UpdateTallerDto){
        
        if(tallerDto.congreso_id){
            
        }
    }
}
