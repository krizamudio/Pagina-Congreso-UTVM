import {
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Transporter } from 'nodemailer';

import { NODEMAILER_TRANSPORT } from './constants/correo.constants';
import { DatosCorreoQrAcceso } from './interfaces/datos-correo-qr-acceso.interface';
import { PlantillaCorreoService } from './plantilla-correo.service';

@Injectable()
export class CorreoService {
  private readonly logger = new Logger(CorreoService.name);

  constructor(
    @Inject(NODEMAILER_TRANSPORT)
    private readonly transporter: Transporter,

    private readonly templates: PlantillaCorreoService,

    private readonly config: ConfigService,
  ) {}

  async enviarQrAcceso(datos: DatosCorreoQrAcceso): Promise<void> {
    const html = this.templates.renderQrAcceso({
      nombreParticipante: datos.nombreParticipante,
      nombreCongreso: datos.nombreCongreso,
      accessUrl: datos.accessUrl,
    });

    try {
      await this.transporter.sendMail({
        from: this.config.getOrThrow<string>('MAIL_FROM'),
        to: datos.destinatario,
        subject: `QR de acceso - ${datos.nombreCongreso}`,
        html,
        attachments: [
          {
            filename: datos.nombreArchivo ?? 'qr-acceso.png',
            content: datos.qrPng,
            contentType: 'image/png',
            cid: 'qr-acceso',
          },
        ],
      });
    } catch (error) {
      this.logger.error(
        'Fallo el envio del correo de acceso QR',
        error instanceof Error ? error.stack : undefined,
      );

      throw new ServiceUnavailableException(
        'No fue posible enviar el correo de acceso',
      );
    }
  }

  async enviarCodigoLogin(
    destinatario: string,
    codigo: string,
    minutosVigencia = 5,
  ): Promise<void> {
    const html = this.templates.renderCodigoLogin({
      codigo,
      minutosVigencia,
    });

    try {
      await this.transporter.sendMail({
        from: this.config.getOrThrow<string>('MAIL_FROM'),
        to: destinatario,
        subject: 'Código de acceso - Congreso UTVM',
        html,
      });
    } catch (error) {
      this.logger.error(
        'Fallo el envio del codigo de acceso',
        error instanceof Error ? error.stack : undefined,
      );

      throw new ServiceUnavailableException(
        'No fue posible enviar el código de acceso',
      );
    }
  }
}
