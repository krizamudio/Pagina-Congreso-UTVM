import { BadRequestException } from '@nestjs/common';

import { ValidadorCommon } from './validador.provider';

describe('ValidadorCommon', () => {
  const validator = new ValidadorCommon();

  function localDate(offsetDays = 0): string {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  describe('FechaValida', () => {
    it('acepta la fecha actual para permitir actividades durante el congreso', () => {
      expect(() => validator.FechaValida(localDate())).not.toThrow();
    });

    it('rechaza una fecha anterior al día actual', () => {
      expect(() => validator.FechaValida(localDate(-1))).toThrow(
        BadRequestException,
      );
    });
  });
});
