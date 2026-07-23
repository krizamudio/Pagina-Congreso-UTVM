import { BadRequestException } from '@nestjs/common';

import { Congreso } from '../../congreso/entities/congreso.entity';
import { AgendaRelationsService } from './agenda-relations.service';

describe('AgendaRelationsService', () => {
  const service = new AgendaRelationsService(
    {} as never,
    {} as never,
    {} as never,
  );
  const congreso = {
    fecha_inicio: new Date('2099-01-10T00:00:00.000Z'),
    fecha_fin: new Date('2099-01-12T00:00:00.000Z'),
  } as Congreso;

  describe('validateDateInsideCongress', () => {
    it.each(['2099-01-10', '2099-01-12'])(
      'acepta el límite inclusivo %s del congreso',
      (fecha) => {
        expect(() =>
          service.validateDateInsideCongress(fecha, congreso),
        ).not.toThrow();
      },
    );

    it.each(['2099-01-09', '2099-01-13'])(
      'rechaza la fecha %s fuera del congreso',
      (fecha) => {
        expect(() =>
          service.validateDateInsideCongress(fecha, congreso),
        ).toThrow(BadRequestException);
      },
    );
  });
});
