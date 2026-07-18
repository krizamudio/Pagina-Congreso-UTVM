/// <reference types="jest" />
/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

import { BadRequestException } from '@nestjs/common';
import { ArchivoMultimedia } from '../entities/archivo_multimedia.entity';
import {
  ARCHIVO_MAX_SIZE,
  crearPipeArchivo,
  perteneceADestino,
} from './archivo-validation.helper';

function archivoAlmacenado(path: string): ArchivoMultimedia {
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
    expect(
      perteneceADestino(archivoAlmacenado('imagenes/foto.webp'), 'imagenes'),
    ).toBe(true);
    expect(
      perteneceADestino(
        archivoAlmacenado('imagenes/noticias/portada.webp'),
        'imagenes',
      ),
    ).toBe(false);
  });

  it('solo acepta el prefijo solicitado', () => {
    const banner = archivoAlmacenado('imagenes/banners/principal.webp');
    expect(perteneceADestino(banner, 'imagenes', 'banners')).toBe(true);
    expect(perteneceADestino(banner, 'imagenes', 'noticias')).toBe(false);
  });
});

function archivoSubido(
  nombre: string,
  mimetype: string,
  buffer: Buffer,
): Express.Multer.File {
  return {
    fieldname: 'comprobante',
    originalname: nombre,
    encoding: '7bit',
    mimetype,
    size: buffer.length,
    buffer,
  } as Express.Multer.File;
}

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

describe('validacion de comprobantes', () => {
  it.each([
    ['pago.pdf', 'application/pdf', Buffer.from('%PDF-1.7')],
    ['pago.jpg', 'image/jpeg', Buffer.from([0xff, 0xd8, 0xff, 0x00])],
    [
      'pago.png',
      'image/png',
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    ],
  ])('acepta %s valido', async (nombre, mimetype, buffer) => {
    await expect(
      crearPipeArchivo('comprobantes').transform(
        archivoSubido(nombre, mimetype, buffer),
      ),
    ).resolves.toBeDefined();
  });

  it.each([
    ['pago.exe', 'application/octet-stream', Buffer.from('MZ')],
    ['pago.jpg', 'image/jpeg', Buffer.from('%PDF-1.7')],
    ['pago.png', 'application/pdf', Buffer.from('%PDF-1.7')],
  ])('rechaza archivo inconsistente %s', async (nombre, mimetype, buffer) => {
    await expect(
      crearPipeArchivo('comprobantes').transform(
        archivoSubido(nombre, mimetype, buffer),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rechaza archivos mayores a 5 MB', async () => {
    const grande = archivoSubido(
      'pago.pdf',
      'application/pdf',
      Buffer.alloc(ARCHIVO_MAX_SIZE + 1),
    );
    grande.buffer.write('%PDF-');

    await expect(
      crearPipeArchivo('comprobantes').transform(grande),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

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
