import { Module } from '@nestjs/common';
import { QrGeneratorService } from './qr-generator.service';
import { QrGeneratorController } from './qr-generator.controller';

@Module({
  controllers: [QrGeneratorController],
  providers: [QrGeneratorService],
})
export class QrGeneratorModule {}
