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

import { CreateNoticiaDto } from '../dto/create-noticia.dto';
import { NoticiaResponseDto } from '../dto/noticia-response.dto';
import { UpdateNoticiaDto } from '../dto/update-noticia.dto';
import { NoticiaService } from '../services/noticia.service';

// TODO: Restringir estos endpoints al administrador autenticado.
@Controller('gestion-contenido/noticias')
export class NoticiaController {
  constructor(private readonly service: NoticiaService) {}

  @Post()
  create(@Body() dto: CreateNoticiaDto): Promise<NoticiaResponseDto> {
    return this.service.create(dto);
  }

  @Get()
  findAll(): Promise<NoticiaResponseDto[]> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<NoticiaResponseDto> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateNoticiaDto,
  ): Promise<NoticiaResponseDto> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<string> {
    return this.service.remove(id);
  }
}
