import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateQrGeneratorDto } from './dto/create-qr-generator.dto';


import * as QRCode from 'qrcode';

@Injectable()
export class QrGeneratorService {
  create(createQrGeneratorDto: CreateQrGeneratorDto): Promise<Buffer> {

    const content: string = createQrGeneratorDto.content;

    if (!content || content === null || content.length === 0){
      throw new BadRequestException('El contenido del QR no puede estar vacío');
    }

    const qrCode = QRCode.toBuffer( content, {
      type: 'png',
      width: 250,
      margin: 2,
      errorCorrectionLevel: 'H'
    });

    return qrCode;
  }
}
