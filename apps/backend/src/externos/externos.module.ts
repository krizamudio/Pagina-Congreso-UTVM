import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ExternosController } from './externos.controller';
import { ExternosService } from './externos.service';
import { Externo } from './entities/externo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Externo]),
  ],
  controllers: [
    ExternosController,
  ],
  providers: [
    ExternosService,
  ],
  exports: [
    ExternosService,
  ],
})
export class ExternosModule {}