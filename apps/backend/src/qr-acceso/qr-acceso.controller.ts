import { Controller, Get, Param, Post } from '@nestjs/common';

import { QrAccesoResponseDto } from './dto/qr-acceso-response.dto';
import { QrTokenParamDto } from './dto/qr-token-param.dto';
import { QrAccesoValidationService } from './services/qr-acceso-validation.service';

// TODO: Agregar autenticacion y autorizacion del personal validador.
@Controller('acceso/qr')
export class QrAccesoController {
  constructor(private readonly validation: QrAccesoValidationService) {}

  @Get(':token')
  inspect(@Param() params: QrTokenParamDto): Promise<QrAccesoResponseDto> {
    return this.validation.inspect(params.token);
  }

  @Post(':token/confirmar')
  confirm(@Param() params: QrTokenParamDto): Promise<QrAccesoResponseDto> {
    return this.validation.confirm(params.token);
  }
}
