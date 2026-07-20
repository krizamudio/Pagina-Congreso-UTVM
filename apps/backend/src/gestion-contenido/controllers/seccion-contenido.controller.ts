import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { CreateSeccionContenidoDto } from '../dto/create-seccion-contenido.dto';
import { SeccionContenidoResponseDto } from '../dto/seccion-contenido-response.dto';
import { UpdateSeccionContenidoDto } from '../dto/update-seccion-contenido.dto';
import { SeccionContenidoService } from '../services/seccion-contenido.service';

// TODO: Restringir estos endpoints al administrador autenticado.
@Controller('gestion-contenido/secciones')
export class SeccionContenidoController {
  constructor(private readonly service: SeccionContenidoService) {}

  @Post()
  create(
    @Body() dto: CreateSeccionContenidoDto,
  ): Promise<SeccionContenidoResponseDto> {
    return this.service.create(dto);
  }

  @Get()
  findAll(): Promise<SeccionContenidoResponseDto[]> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SeccionContenidoResponseDto> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSeccionContenidoDto,
  ): Promise<SeccionContenidoResponseDto> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<string> {
    return this.service.remove(id);
  }
}
