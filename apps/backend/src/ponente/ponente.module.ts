import { Module } from '@nestjs/common';
import { PonenteService } from './ponente.service';
import { PonenteController } from './ponente.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ponente } from './entities/ponente.entity';

@Module({
  controllers: [PonenteController],
  providers: [PonenteService],
  imports: [TypeOrmModule.forFeature([Ponente])]
})
export class PonenteModule {}
