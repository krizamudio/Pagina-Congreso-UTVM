import { FileValidator, ParseFilePipe } from '@nestjs/common';

import { ArchivoMultimedia } from '../entities/archivo_multimedia.entity';

export type ArchivoCategoria = 'imagenes' | 'documentos';
export type ArchivoDestino = 'banners' | 'noticias';

export const ARCHIVO_MAX_SIZE = 5 * 1024 * 1024;
export const ARCHIVO_UPLOAD_OPTIONS = {
  limits: { fileSize: ARCHIVO_MAX_SIZE },
};

interface TipoPermitido {
  extensiones: readonly string[];
  firma: (buffer: Buffer) => boolean;
}

const TIPOS_PERMITIDOS: Record<
  ArchivoCategoria,
  Record<string, TipoPermitido>
> = {
  imagenes: {
    'image/jpeg': {
      extensiones: ['jpg', 'jpeg'],
      firma: (buffer) =>
        buffer.length >= 3 &&
        buffer[0] === 0xff &&
        buffer[1] === 0xd8 &&
        buffer[2] === 0xff,
    },
    'image/png': {
      extensiones: ['png'],
      firma: (buffer) =>
        buffer.length >= 8 &&
        buffer
          .subarray(0, 8)
          .equals(
            Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
          ),
    },
    'image/webp': {
      extensiones: ['webp'],
      firma: (buffer) =>
        buffer.length >= 12 &&
        buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
        buffer.subarray(8, 12).toString('ascii') === 'WEBP',
    },
  },
  documentos: {
    'application/pdf': {
      extensiones: ['pdf'],
      firma: (buffer) =>
        buffer.length >= 5 &&
        buffer.subarray(0, 5).toString('ascii') === '%PDF-',
    },
  },
};

class ArchivoValidator extends FileValidator<{
  categoria: ArchivoCategoria;
}> {
  isValid(file?: Express.Multer.File): boolean {
    if (!file || file.size > ARCHIVO_MAX_SIZE) return false;

    const tipo =
      TIPOS_PERMITIDOS[this.validationOptions.categoria][file.mimetype];
    if (!tipo) return false;

    const extensionValida = tipo.extensiones.includes(
      obtenerExtensionOriginal(file.originalname),
    );
    return extensionValida && tipo.firma(file.buffer);
  }

  buildErrorMessage(): string {
    return this.validationOptions.categoria === 'imagenes'
      ? 'El campo foto solo permite imagenes JPEG, PNG o WebP validas de hasta 5 MB'
      : 'El campo archivo solo permite documentos PDF validos de hasta 5 MB';
  }
}

export function crearPipeArchivo(categoria: ArchivoCategoria): ParseFilePipe {
  return new ParseFilePipe({
    fileIsRequired: true,
    validators: [new ArchivoValidator({ categoria })],
  });
}

export function obtenerExtensionArchivo(
  archivo: Express.Multer.File,
  categoria: ArchivoCategoria,
): string {
  const tipo = TIPOS_PERMITIDOS[categoria][archivo.mimetype];
  return tipo.extensiones[0];
}

export function perteneceACategoria(
  archivo: ArchivoMultimedia,
  categoria: ArchivoCategoria,
): boolean {
  return (
    Boolean(TIPOS_PERMITIDOS[categoria][archivo.tipo_mime]) &&
    archivo.path.startsWith(`${categoria}/`)
  );
}

export function perteneceADestino(
  archivo: ArchivoMultimedia,
  categoria: ArchivoCategoria,
  destino?: ArchivoDestino,
): boolean {
  if (!perteneceACategoria(archivo, categoria)) return false;
  if (destino) return archivo.path.startsWith(`${categoria}/${destino}/`);

  const relativePath = archivo.path.slice(`${categoria}/`.length);
  return relativePath.length > 0 && !relativePath.includes('/');
}

function obtenerExtensionOriginal(nombre: string): string {
  const ultimoPunto = nombre.lastIndexOf('.');
  return ultimoPunto >= 0 ? nombre.slice(ultimoPunto + 1).toLowerCase() : '';
}
