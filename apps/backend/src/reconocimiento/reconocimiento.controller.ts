import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';

import { FindReconocimientoDto } from './dto/find-reconocimiento.dto';
import { ReconocimientoService } from './reconocimiento.service';

@Controller('reconocimientos')
export class ReconocimientoController {
  constructor(private readonly reconocimientos: ReconocimientoService) {}

  @Get()
  findAll(@Query() query: FindReconocimientoDto) {
    return this.reconocimientos.findAll(query);
  }

  @Get(':id/pdf')
  async download(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() response: Response,
  ): Promise<void> {
    const result = await this.reconocimientos.generatePdf(id);
    response
      .type('application/pdf')
      .attachment(result.filename)
      .send(result.pdf);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.reconocimientos.findOne(id);
  }
}
