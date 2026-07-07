import { Module } from '@nestjs/common';
import { ConferenciasService } from './conferencia.service';
import { ConferenciasController } from './conferencia.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conferencia } from './entities/conferencia.entity';
import { CommonModule } from '../../common/common.module';
import { Congreso } from '../congreso/entities/congreso.entity';
import { Ponente } from '../ponente/entities/ponente.entity';
import { Ubicacion } from '../ubicacion/entities/ubicacion.entity';
import { ConferenciaRelacionesProvider } from './providers/conferencia-relaciones.provider';

@Module({
  controllers: [ConferenciasController],
  providers: [ConferenciasService, ConferenciaRelacionesProvider],
  imports: [
    TypeOrmModule.forFeature([Conferencia, Congreso, Ponente, Ubicacion]),
    CommonModule,
  ],
})
export class ConferenciasModule {}
