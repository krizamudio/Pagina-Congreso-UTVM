/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { BadRequestException } from '@nestjs/common';

import {
  ARCHIVO_MAX_SIZE,
  crearPipeArchivo,
} from './archivo-validation.helper';

function archivo(
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
        archivo(nombre, mimetype, buffer),
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
        archivo(nombre, mimetype, buffer),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rechaza archivos mayores a 5 MB', async () => {
    const grande = archivo(
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
