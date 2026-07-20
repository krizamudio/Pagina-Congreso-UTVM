import { PDFDocument } from 'pdf-lib';

import { ReconocimientoTipo } from '../enums/reconocimiento-tipo.enum';
import { ReconocimientoRendererService } from './reconocimiento-renderer.service';

describe('ReconocimientoRendererService', () => {
  const service = new ReconocimientoRendererService();

  it.each([
    [ReconocimientoTipo.GENERAL, 'María José Hernández'],
    [ReconocimientoTipo.TALLERISTA, 'Óscar Núñez'],
    [
      ReconocimientoTipo.CONFERENCISTA,
      'María Fernanda de los Ángeles Hernández González del Valle',
    ],
  ])('genera un PDF válido para %s', async (tipo, nombre) => {
    const pdf = await service.render(tipo, nombre);

    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
    const document = await PDFDocument.load(pdf);
    expect(document.getPageCount()).toBe(1);
    expect(document.getPage(0).getSize()).toEqual({
      width: 768.25,
      height: 598.125,
    });
  });
});
