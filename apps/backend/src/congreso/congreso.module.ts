import { Module } from '@nestjs/common';
import { CongresoService } from './congreso.service';
import { CongresoController } from './congreso.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Congreso } from './entities/congreso.entity';
import { CommonModule } from '../common/common.module';
import { ForoEmpresarial } from '../foro-empresarial/entities/foro-empresarial.entity';

@Module({
  controllers: [CongresoController],
  providers: [CongresoService],
  imports: [
    TypeOrmModule.forFeature([Congreso, ForoEmpresarial]),
    CommonModule,
  ],
})
export class CongresoModule {}
