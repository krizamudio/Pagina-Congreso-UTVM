import { Module } from '@nestjs/common';

import { CorreoService } from './correo.service';
import { PlantillaCorreoService } from './plantilla-correo.service';
import { NodemailerProvider } from './providers/nodemailer.provider';

@Module({
  providers: [NodemailerProvider, PlantillaCorreoService, CorreoService],
  exports: [CorreoService],
})
export class CorreoModule {}
