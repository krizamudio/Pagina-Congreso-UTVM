import { Module } from '@nestjs/common';

import { TallerModule } from '../taller/taller.module';
import { InscripcionTallerController } from './inscripcion-taller.controller';
import { InscripcionTallerService } from './inscripcion-taller.service';

@Module({
  imports: [TallerModule],
  controllers: [InscripcionTallerController],
  providers: [InscripcionTallerService],
  exports: [InscripcionTallerService],
})
export class InscripcionTallerModule {}
