import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConferenciasModule } from './conferencia/conferencia.module';
import { TallerModule } from './taller/taller.module';

@Module({
  imports: [
    UserModule, 
    ConfigModule.forRoot({ envFilePath: '.env' ,isGlobal: true}),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: +process.env.POSTGRES_PORT!,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: ['dist/**/*.entity{.ts,.js}'],
      autoLoadEntities: true,
      synchronize: true,
    }),
    ConferenciasModule,
    TallerModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
