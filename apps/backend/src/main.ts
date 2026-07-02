import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

async function main() {
  const app = await NestFactory.create(AppModule);
  const uploadDir = join(process.cwd(), 'uploads');
  if ( !existsSync(uploadDir)){
    mkdirSync(uploadDir);
  }
  app.setGlobalPrefix('api/');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
main();
