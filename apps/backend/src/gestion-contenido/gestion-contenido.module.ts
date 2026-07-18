import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArchivoMultimediaModule } from '../archivo_multimedia/archivo_multimedia.module';
import { CommonModule } from '../common/common.module';
import { Conferencia } from '../conferencia/entities/conferencia.entity';
import { Congreso } from '../congreso/entities/congreso.entity';
import { Taller } from '../taller/entities/taller.entity';
import { AgendaModule } from './agenda/agenda.module';
import { BannerController } from './controllers/banner.controller';
import { ContenidoImagenController } from './controllers/contenido-imagen.controller';
import { NoticiaController } from './controllers/noticia.controller';
import { PaginaOficialController } from './controllers/pagina-oficial.controller';
import { SeccionContenidoController } from './controllers/seccion-contenido.controller';
import { Banner } from './entities/banner.entity';
import { Noticia } from './entities/noticia.entity';
import { SeccionContenido } from './entities/seccion-contenido.entity';
import { BannerService } from './services/banner.service';
import { ContenidoArchivoService } from './services/contenido-archivo.service';
import { ContenidoImagenLifecycleService } from './services/contenido-imagen-lifecycle.service';
import { ContenidoImagenService } from './services/contenido-imagen.service';
import { ContenidoRelationsService } from './services/contenido-relations.service';
import { ContenidoSlugService } from './services/contenido-slug.service';
import { NoticiaService } from './services/noticia.service';
import { PaginaOficialService } from './services/pagina-oficial.service';
import { SeccionContenidoService } from './services/seccion-contenido.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Noticia,
      SeccionContenido,
      Banner,
      Congreso,
      Conferencia,
      Taller,
    ]),
    ArchivoMultimediaModule,
    CommonModule,
    AgendaModule,
  ],
  controllers: [
    NoticiaController,
    SeccionContenidoController,
    BannerController,
    ContenidoImagenController,
    PaginaOficialController,
  ],
  providers: [
    NoticiaService,
    SeccionContenidoService,
    BannerService,
    ContenidoImagenService,
    ContenidoArchivoService,
    ContenidoImagenLifecycleService,
    ContenidoRelationsService,
    ContenidoSlugService,
    PaginaOficialService,
  ],
})
export class GestionContenidoModule {}
