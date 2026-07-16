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

  constructor() {
    const path = join(__dirname, 'templates', 'qr-acceso.hbs');
    this.qrAccesoTemplate = Handlebars.compile(readFileSync(path, 'utf8'), {
      strict: true,
    });
  }

  renderQrAcceso(data: {
    nombreParticipante: string;
    nombreCongreso: string;
    accessUrl: string;
  }): string {
    return this.qrAccesoTemplate(data);
  }
}
