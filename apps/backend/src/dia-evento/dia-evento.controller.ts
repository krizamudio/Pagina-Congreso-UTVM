import { Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';

import { DiaEventoResponse, DiaEventoService } from './dia-evento.service';

// TODO: Agregar autenticacion y autorizacion administrativa.
@Controller('congresos/:congresoId/dias-evento')
export class DiaEventoController {
  constructor(private readonly dias: DiaEventoService) {}

  @Post('generar')
  generar(
    @Param('congresoId', ParseUUIDPipe) congresoId: string,
  ): Promise<DiaEventoResponse[]> {
    return this.dias.generar(congresoId);
  }

  @Get()
  findAll(
    @Param('congresoId', ParseUUIDPipe) congresoId: string,
  ): Promise<DiaEventoResponse[]> {
    return this.dias.findByCongreso(congresoId);
  }
}
