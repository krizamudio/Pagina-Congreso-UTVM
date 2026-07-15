import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

import { NODEMAILER_TRANSPORT } from '../constants/correo.constants';

export const NodemailerProvider: Provider = {
  provide: NODEMAILER_TRANSPORT,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const host = config.get<string>('MAIL_HOST');
    const port = Number(config.get<string>('MAIL_PORT', '587'));
    const user = config.get<string>('MAIL_USER');
    const pass = config.get<string>('MAIL_PASS');
    const from = config.get<string>('MAIL_FROM');
    const production = config.get<string>('NODE_ENV') === 'production';
    const missing = [
      ['MAIL_HOST', host],
      ['MAIL_USER', user],
      ['MAIL_PASS', pass],
      ['MAIL_FROM', from],
    ]
      .filter(([, value]) => !value)
      .map(([name]) => name);

    if (production && missing.length > 0) {
      throw new Error(
        `Configuracion de correo incompleta: ${missing.join(', ')}`,
      );
    }
    if (!Number.isInteger(port) || port <= 0 || port > 65535) {
      throw new Error('MAIL_PORT debe ser un puerto valido');
    }

    const secureValue = config.get<string>('MAIL_SECURE');
    const secure = secureValue ? secureValue === 'true' : port === 465;
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
    });
  },
};
