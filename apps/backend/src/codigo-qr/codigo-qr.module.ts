import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CodigoQrService } from './codigo-qr.service';
import { CodigoQrController } from './codigo-qr.controller';
import { CodigoQr } from './entities/codigo-qr.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CodigoQr])],
  controllers: [CodigoQrController],
  providers: [CodigoQrService],
  exports: [CodigoQrService, TypeOrmModule],
})
export class CodigoQrModule {}
