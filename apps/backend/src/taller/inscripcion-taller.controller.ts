import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';

import { CreateInscripcionTallerDto } from './dto/create-inscripcion-taller.dto';
import { InscripcionTallerService } from './services/inscripcion-taller.service';

@Controller('talleres/:tallerId/inscripciones')
export class InscripcionTallerController {
  constructor(private readonly inscripciones: InscripcionTallerService) {}

  @Post()
  create(
    @Param('tallerId', ParseUUIDPipe) tallerId: string,
    @Body() dto: CreateInscripcionTallerDto,
  ) {
    return this.inscripciones.create(tallerId, dto);
  }

  @Get()
  findAll(@Param('tallerId', ParseUUIDPipe) tallerId: string) {
    return this.inscripciones.findAll(tallerId);
  }
}
