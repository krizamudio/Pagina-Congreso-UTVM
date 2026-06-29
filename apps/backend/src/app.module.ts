import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from './datasource/typeorm.module';
import { ConfigModule } from '@nestjs/config';
import { ExternosModule } from './externos/externos.module';


@Module({
  imports: [TypeOrmModule, UserModule, 
    ConfigModule.forRoot({isGlobal: true}), ExternosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
