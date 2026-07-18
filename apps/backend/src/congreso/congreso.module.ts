import { Module } from '@nestjs/common';
import { CongresoService } from './congreso.service';
import { CongresoController } from './congreso.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Congreso } from './entities/congreso.entity';
import { CommonModule } from '../common/common.module';
import { ForoEmpresarial } from '../foro-empresarial/entities/foro-empresarial.entity';
import { Banner } from '../gestion-contenido/entities/banner.entity';
import { Noticia } from '../gestion-contenido/entities/noticia.entity';
import { SeccionContenido } from '../gestion-contenido/entities/seccion-contenido.entity';

@Module({
  controllers: [CongresoController],
  providers: [CongresoService],
  imports: [
    TypeOrmModule.forFeature([
      Congreso,
      ForoEmpresarial,
      Noticia,
      SeccionContenido,
      Banner,
    ]),
    CommonModule,
  ],
})
export class CongresoModule {}
