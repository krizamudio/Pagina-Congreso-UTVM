import { createHash, randomBytes } from 'node:crypto';

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as QRCode from 'qrcode';

export interface GeneratedAccessQr {
  token: string;
  tokenHash: string;
  accessUrl: string;
  png: Buffer;
}

@Injectable()
export class QrGeneratorService {
  constructor(private readonly config: ConfigService) {}

  async generateAccessQr(): Promise<GeneratedAccessQr> {
    const token = randomBytes(32).toString('base64url');
    const tokenHash = this.hashToken(token);
    const baseUrl = this.config
      .get<string>('QR_ACCESS_BASE_URL', 'http://localhost:9000/acceso/qr')
      .replace(/\/$/, '');
    const accessUrl = `${baseUrl}/${token}`;

    try {
      const png = await QRCode.toBuffer(accessUrl, {
        type: 'png',
        width: 320,
        margin: 2,
        errorCorrectionLevel: 'H',
      });
      return { token, tokenHash, accessUrl, png };
    } catch {
      throw new InternalServerErrorException('No se pudo generar el codigo QR');
    }
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token, 'utf8').digest('hex');
  }
}
