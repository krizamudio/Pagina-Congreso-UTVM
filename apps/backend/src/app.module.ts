import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ExternosModule } from './externos/externos.module';
import { RegistroNsuModule } from './registro-nsu/registro-nsu.module';
import { ConferenciasModule } from './conferencia/conferencia.module';
import { TallerModule } from './taller/taller.module';
import { PonenteModule } from './ponente/ponente.module';
import { EmsModule } from './ems/ems.module';
import { UtvmModule } from './utvm/utvm.module';
import { ArchivoMultimediaModule } from './archivo_multimedia/archivo_multimedia.module';
import { CommonModule } from './common/common.module';
import { CongresoModule } from './congreso/congreso.module';
import { UbicacionModule } from './ubicacion/ubicacion.module';
import { seconds, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { QrAccesoModule } from './qr-acceso/qr-acceso.module';
import { DiaEventoModule } from './dia-evento/dia-evento.module';
import { ComprobanteModule } from './comprobante/comprobante.module';
import { ForoEmpresarialModule } from './foro-empresarial/foro-empresarial.module';
import { GestionContenidoModule } from './gestion-contenido/gestion-contenido.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          // No mas de 3 llamadas en un segundo.
          name: 'short',
          ttl: seconds(1),
          limit: 3,
          blockDuration: seconds(30),
        },
        {
          // No mas de 20 llamadas en 10 segundos.
          name: 'medium',
          ttl: seconds(10),
          limit: 20,
          blockDuration: seconds(30),
        },
        {
          // No mas de 100 llamadas en un minuto.
          name: 'long',
          ttl: seconds(60),
          limit: 100,
          blockDuration: seconds(60),
        },
      ],
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: +process.env.POSTGRES_PORT!,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: ['dist/**/*.entity{.ts,.js}'],
      autoLoadEntities: true,
      // TODO: Sustituir synchronize por migraciones antes de produccion.
      synchronize: true,
      extra: {
        options: '-c timezone=America/Mexico_City',
      },
    }),

    ExternosModule,
    RegistroNsuModule,
    ConferenciasModule,
    TallerModule,
    PonenteModule,
    EmsModule,
    UtvmModule,
    ArchivoMultimediaModule,
    CommonModule,
    CongresoModule,
    UbicacionModule,
    DiaEventoModule,
    QrAccesoModule,
    ComprobanteModule,
    ForoEmpresarialModule,
    GestionContenidoModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
