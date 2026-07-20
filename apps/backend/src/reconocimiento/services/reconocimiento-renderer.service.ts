import { Injectable } from '@nestjs/common';
import fontkit from '@pdf-lib/fontkit';
import { PDFDocument, PDFPage, PDFFont, rgb } from 'pdf-lib';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { ReconocimientoTipo } from '../enums/reconocimiento-tipo.enum';

interface TemplateDefinition {
  background: string;
  nameBox: { x: number; yFromTop: number; width: number; height: number };
}

@Injectable()
export class ReconocimientoRendererService {
  private readonly resourcesDir = join(__dirname, '..', '..', 'resources');
  private readonly templates: Record<ReconocimientoTipo, TemplateDefinition> = {
    [ReconocimientoTipo.GENERAL]: this.template('general.jpg'),
    [ReconocimientoTipo.TALLERISTA]: this.template('tallerista.jpg'),
    [ReconocimientoTipo.CONFERENCISTA]: this.template('conferencista.jpg'),
  };

  async render(tipo: ReconocimientoTipo, nombre: string): Promise<Buffer> {
    const template = this.templates[tipo];
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
    return Buffer.from(await document.save());
  }

  private drawCenteredName(
    page: PDFPage,
    font: PDFFont,
    nombre: string,
    box: TemplateDefinition['nameBox'],
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

  private template(background: string): TemplateDefinition {
    return {
      background,
      nameBox: {
        x: 115.71,
        yFromTop: 321.43,
        width: 574.46,
        height: 29.08,
      },
    };
  }
}
