import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { Injectable } from '@nestjs/common';
import Handlebars from 'handlebars';

@Injectable()
export class PlantillaCorreoService {
  private readonly qrAccesoTemplate: Handlebars.TemplateDelegate<{
    nombreParticipante: string;
    nombreCongreso: string;
    accessUrl: string;
  }>;

  private readonly codigoLoginTemplate: Handlebars.TemplateDelegate<{
    codigo: string;
    minutosVigencia: number;
  }>;

  constructor() {
    const qrAccesoPath = join(__dirname, 'templates', 'qr-acceso.hbs');

    this.qrAccesoTemplate = Handlebars.compile(
      readFileSync(qrAccesoPath, 'utf8'),
      {
        strict: true,
      },
    );

    const codigoLoginPath = join(__dirname, 'templates', 'codigo-login.hbs');

    this.codigoLoginTemplate = Handlebars.compile(
      readFileSync(codigoLoginPath, 'utf8'),
      {
        strict: true,
      },
    );
  }

  renderQrAcceso(data: {
    nombreParticipante: string;
    nombreCongreso: string;
    accessUrl: string;
  }): string {
    return this.qrAccesoTemplate(data);
  }

  renderCodigoLogin(data: { codigo: string; minutosVigencia: number }): string {
    return this.codigoLoginTemplate(data);
  }
}
