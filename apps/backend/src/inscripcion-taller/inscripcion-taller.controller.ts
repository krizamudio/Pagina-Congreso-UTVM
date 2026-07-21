import { Body, Controller, Post } from '@nestjs/common';

import { CrearInscripcionTallerDto } from './dto/crear-inscripcion-taller.dto';
import { InscripcionTallerService } from './inscripcion-taller.service';

@Controller('inscripcion-taller')
export class InscripcionTallerController {
  constructor(
    private readonly inscripcionTallerService: InscripcionTallerService,
  ) {}

  @Post()
  inscribir(@Body() dto: CrearInscripcionTallerDto) {
    return this.inscripcionTallerService.inscribir(dto);
  }
}
