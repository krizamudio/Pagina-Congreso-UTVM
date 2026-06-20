import { Controller, Post, Body, Res } from '@nestjs/common';
import { QrGeneratorService } from './qr-generator.service';
import { CreateQrGeneratorDto } from './dto/create-qr-generator.dto';

import type { Response } from 'express';


//TODO: Este controlador se va a quitar, se implemento temporalmente para hacer pruebas de funcionamiento
@Controller('qr-generator')
export class QrGeneratorController {
  constructor(private readonly qrGeneratorService: QrGeneratorService) { }

  @Post()
  async getQR(
    @Body() QR: CreateQrGeneratorDto,
    @Res() response: Response): Promise<void> {

    const qrBuffer = await this.qrGeneratorService.create(
      QR
    );

    response.setHeader('content-Type', 'image/png');
    response.setHeader('Content-Disposition',
      'attachment; filename="qr.png"');
    response.send(qrBuffer);

  }
}
