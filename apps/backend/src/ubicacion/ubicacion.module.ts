import { Module } from '@nestjs/common';
import { UbicacionService } from './ubicacion.service';
import { UbicacionController } from './ubicacion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ubicacion } from './entities/ubicacion.entity';
import { CommonModule } from '../common/common.module';
import { UbicacionMapperService } from './mappers/ubicacion.mapper.service';

@Module({
  controllers: [UbicacionController],
  providers: [
    UbicacionService,
    UbicacionMapperService,
  ],
  imports: [TypeOrmModule.forFeature([Ubicacion]), CommonModule],
})
export class UbicacionModule {}
