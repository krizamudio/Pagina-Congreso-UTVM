import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from './datasource/typeorm.module';
import { UserModule } from './user/user.module';
import { RegistroNsuModule } from './registro-nsu/registro-nsu.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule,
    UserModule,
    RegistroNsuModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
