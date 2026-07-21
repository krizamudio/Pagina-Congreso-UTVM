import { Module } from '@nestjs/common';
import { UbicacionService } from './ubicacion.service';
import { UbicacionController } from './ubicacion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ubicacion } from './entities/ubicacion.entity';
import { CommonModule } from '../common/common.module';
import { UbicacionMapperService } from './mappers/ubicacion.mapper.service';
import { ForoEmpresarial } from '../foro-empresarial/entities/foro-empresarial.entity';
import { TallerModule } from '../taller/taller.module';

@Module({
  controllers: [UbicacionController],
  providers: [UbicacionService, UbicacionMapperService],
  imports: [
    TypeOrmModule.forFeature([Ubicacion, ForoEmpresarial]),
    CommonModule,
    TallerModule,
  ],
})
export class UbicacionModule {}
