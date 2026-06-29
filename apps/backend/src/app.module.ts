import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ExternosModule } from './externos/externos.module';
import { UserModule } from './user/user.module';
import { RegistroNsuModule } from './registro-nsu/registro-nsu.module';
import { ConferenciasModule } from './conferencia/conferencia.module';
import { TallerModule } from './taller/taller.module';
import { PonenteModule } from './ponente/ponente.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: ['dist/**/*.entity{.ts,.js}'],
      autoLoadEntities: true,
      synchronize: true,
    }),

    UserModule,
    RegistroNsuModule,
    ConferenciasModule,
    TallerModule,
    PonenteModule,
    ExternosModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}