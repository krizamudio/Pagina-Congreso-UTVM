import { Body, Controller, Param, ParseUUIDPipe, Patch } from '@nestjs/common';

import { CodigoQrService } from './codigo-qr.service';
import { RevocarCodigoQrDto } from './dto/revocar-codigo-qr.dto';

// TODO: Agregar autenticacion y autorizacion administrativa.
@Controller('codigo-qr')
export class CodigoQrController {
  constructor(private readonly codigos: CodigoQrService) {}

  @Patch(':id/revocar')
  revoke(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RevocarCodigoQrDto,
  ): Promise<string> {
    return this.codigos.revoke(id, dto);
  }
}
