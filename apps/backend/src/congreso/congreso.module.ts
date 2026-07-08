import { Module } from '@nestjs/common';
import { CongresoService } from './congreso.service';
import { CongresoController } from './congreso.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Congreso } from './entities/congreso.entity';

@Module({
  controllers: [CongresoController],
  providers: [CongresoService],
  imports: [TypeOrmModule.forFeature([Congreso])]
})
export class CongresoModule {}
