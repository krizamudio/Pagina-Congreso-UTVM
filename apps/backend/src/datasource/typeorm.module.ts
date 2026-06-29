import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DataSource,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const dataSource = new DataSource({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: configService.get<string>('POSTGRES_USER'),
          password: configService.get<string>('POSTGRES_PASSWORD'),
          database: configService.get<string>('POSTGRES_DB'),
          synchronize: true,
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        });

        return dataSource.initialize();
      },
    },
  ],
  exports: [DataSource],
})
export class TypeOrmModule {}
