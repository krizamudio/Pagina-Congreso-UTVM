import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QrGeneratorModule } from './qr-generator/qr-generator.module';

@Module({
  imports: [QrGeneratorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
