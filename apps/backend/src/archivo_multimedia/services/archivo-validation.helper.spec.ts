/// <reference types="jest" />

import { ArchivoMultimedia } from '../entities/archivo_multimedia.entity';
import { perteneceADestino } from './archivo-validation.helper';

function archivo(path: string): ArchivoMultimedia {
  return {
    id: '7a04c281-043b-445f-9997-f6a10411da9d',
    subido_por_usuario_id: '2f8063f8-357c-4bd1-b4b7-ece11f63141a',
    ruta_archivo: 'https://storage.example.com/image.webp',
    path,
    tipo_mime: 'image/webp',
    created_at: new Date(),
    updated_at: new Date(),
  };
}

describe('perteneceADestino', () => {
  it('separa una foto general de las imágenes de contenido', () => {
    expect(perteneceADestino(archivo('imagenes/foto.webp'), 'imagenes')).toBe(
      true,
    );
    expect(
      perteneceADestino(archivo('imagenes/noticias/portada.webp'), 'imagenes'),
    ).toBe(false);
  });

  it('solo acepta el prefijo solicitado', () => {
    const banner = archivo('imagenes/banners/principal.webp');
    expect(perteneceADestino(banner, 'imagenes', 'banners')).toBe(true);
    expect(perteneceADestino(banner, 'imagenes', 'noticias')).toBe(false);
  });
});
