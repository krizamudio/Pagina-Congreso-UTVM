import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArchivoMultimediaModule } from '../archivo_multimedia/archivo_multimedia.module';
import { CommonModule } from '../common/common.module';
import { Congreso } from '../congreso/entities/congreso.entity';
import { Ubicacion } from '../ubicacion/entities/ubicacion.entity';
import { Ponente } from '../ponente/entities/ponente.entity';
import { ForoEmpresarial } from './entities/foro-empresarial.entity';
import { ForoEmpresarialController } from './foro-empresarial.controller';
import { ForoEmpresarialMapper } from './mappers/foro-empresarial.mapper';
import { ForoEmpresarialLogoService } from './services/foro-empresarial-logo.service';
import { ForoEmpresarialRelationsService } from './services/foro-empresarial-relations.service';
import { ForoEmpresarialService } from './services/foro-empresarial.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ForoEmpresarial, Congreso, Ubicacion, Ponente]),
    ArchivoMultimediaModule,
    CommonModule,
  ],
  controllers: [ForoEmpresarialController],
  providers: [
    ForoEmpresarialService,
    ForoEmpresarialRelationsService,
    ForoEmpresarialLogoService,
    ForoEmpresarialMapper,
  ],
})
export class ForoEmpresarialModule {}
