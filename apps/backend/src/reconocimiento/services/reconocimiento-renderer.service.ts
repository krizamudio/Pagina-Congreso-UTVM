import { Injectable } from '@nestjs/common';
import fontkit from '@pdf-lib/fontkit';
import { PDFDocument, PDFPage, PDFFont, rgb } from 'pdf-lib';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { ReconocimientoTipo } from '../enums/reconocimiento-tipo.enum';
import {
  RecognitionTemplate,
  ReconocimientoTemplateRegistryService,
} from './reconocimiento-template-registry.service';

export interface ReconocimientoRenderContext {
  equipo?: string;
  resultado?: string;
  participacion?: string;
}

@Injectable()
export class ReconocimientoRendererService {
  private readonly resourcesDir = join(__dirname, '..', '..', 'resources');
  constructor(
    private readonly registry: ReconocimientoTemplateRegistryService = new ReconocimientoTemplateRegistryService(),
  ) {}

  async render(
    tipo: ReconocimientoTipo,
    nombre: string,
    context: ReconocimientoRenderContext = {},
  ): Promise<Buffer> {
    const template = this.registry.get(tipo);
    const [backgroundBytes, fontBytes] = await Promise.all([
      readFile(join(this.resourcesDir, 'backgrounds', template.background)),
      readFile(join(this.resourcesDir, 'fonts', 'NotoSans-Bold.ttf')),
    ]);
    const document = await PDFDocument.create();
    document.registerFontkit(fontkit);
    const background = await document.embedJpg(backgroundBytes);
    const font = await document.embedFont(fontBytes, { subset: true });
    const page = document.addPage([768.25, 598.125]);
    page.drawImage(background, {
      x: 0,
      y: 0,
      width: page.getWidth(),
      height: page.getHeight(),
    });
    this.drawCenteredName(page, font, nombre.trim(), template.nameBox);
    const details =
      tipo === ReconocimientoTipo.HACKATON_EVALUADOR
        ? [context.participacion ?? 'Participación como evaluador del Hackatón']
        : [
            context.equipo ? `Equipo: ${context.equipo}` : '',
            context.resultado ?? '',
          ];
    template.detailBoxes?.forEach((box, index) => {
      if (details[index])
        this.drawCenteredName(page, font, details[index], {
          x: 110,
          width: 548,
          ...box,
        });
    });
    return Buffer.from(await document.save());
  }

  private drawCenteredName(
    page: PDFPage,
    font: PDFFont,
    nombre: string,
    box: RecognitionTemplate['nameBox'],
  ): void {
    let size = 24;
    while (size > 12 && font.widthOfTextAtSize(nombre, size) > box.width) {
      size -= 0.5;
    }
    const width = font.widthOfTextAtSize(nombre, size);
    const y = page.getHeight() - box.yFromTop - box.height;
    page.drawText(nombre, {
      x: box.x + Math.max(0, (box.width - width) / 2),
      y: y + Math.max(0, (box.height - size) / 2) + 2,
      size,
      font,
      color: rgb(0, 0, 0),
    });
  }
}
