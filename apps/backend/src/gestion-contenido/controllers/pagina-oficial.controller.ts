import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';

import {
  PaginaNoticiaDetalleDto,
  PaginaOficialResponseDto,
} from '../dto/pagina-oficial-response.dto';
import { PaginaOficialService } from '../services/pagina-oficial.service';

@Controller('pagina-oficial')
export class PaginaOficialController {
  constructor(private readonly service: PaginaOficialService) {}

  @Get('congresos/:congresoId')
  findPage(
    @Param('congresoId', ParseUUIDPipe) congresoId: string,
  ): Promise<PaginaOficialResponseDto> {
    return this.service.findPage(congresoId);
  }

  @Get('noticias/:slug')
  findNews(@Param('slug') slug: string): Promise<PaginaNoticiaDetalleDto> {
    return this.service.findNews(slug);
  }
}
