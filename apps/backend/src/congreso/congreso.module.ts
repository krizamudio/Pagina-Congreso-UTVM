import { Module } from '@nestjs/common';
import { CongresoService } from './congreso.service';
import { CongresoController } from './congreso.controller';

@Module({
  controllers: [CongresoController],
  providers: [CongresoService],
})
export class CongresoModule {}
