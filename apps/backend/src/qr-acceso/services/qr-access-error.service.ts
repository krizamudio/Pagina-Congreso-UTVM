import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

import { QrResultado } from '../qr-resultado.enum';

const MENSAJES: Record<QrResultado, string> = {
  [QrResultado.VALIDO]: 'QR valido',
  [QrResultado.NO_ENCONTRADO]: 'QR no encontrado',
  [QrResultado.INACTIVO]: 'El QR esta inactivo',
  [QrResultado.EXPIRADO]: 'El QR ha expirado',
  [QrResultado.TIPO_INVALIDO]: 'El tipo de QR no es valido para acceso',
  [QrResultado.PARTICIPANTE_NO_VALIDADO]: 'El participante no esta validado',
  [QrResultado.DIA_NO_AUTORIZADO]:
    'El participante no tiene acceso autorizado este dia',
  [QrResultado.ACCESO_YA_UTILIZADO]: 'El acceso de este dia ya fue utilizado',
  [QrResultado.FUERA_DE_FECHA]: 'La fecha actual no pertenece al congreso',
};

@Injectable()
export class QrAccessErrorService {
  fail(resultado: Exclude<QrResultado, QrResultado.VALIDO>): never {
    const body = {
      valido: false,
      puedeIngresar: false,
      resultado,
      message: MENSAJES[resultado],
    };

    if (resultado === QrResultado.NO_ENCONTRADO) {
      throw new NotFoundException(body);
    }
    if (resultado === QrResultado.ACCESO_YA_UTILIZADO) {
      throw new ConflictException(body);
    }
    throw new UnprocessableEntityException(body);
  }
}
