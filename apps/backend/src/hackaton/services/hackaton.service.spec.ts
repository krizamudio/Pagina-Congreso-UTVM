import { BadRequestException } from '@nestjs/common';
import { Congreso } from '../../congreso/entities/congreso.entity';
import { HackatonService } from './hackaton.service';

describe('HackatonService date validation', () => {
  const service = new HackatonService({} as never, {} as never, {} as never);
  const congreso = {
    fecha_inicio: new Date(2026, 7, 10),
    fecha_fin: new Date(2026, 7, 12),
  } as Congreso;
  const validate = (start: string, end: string) =>
    (
      service as unknown as {
        validateDates: (a: string, b: string, c: Congreso) => void;
      }
    ).validateDates(start, end, congreso);

  it('incluye ambos días límite del congreso', () => {
    expect(() => validate('2026-08-10', '2026-08-12')).not.toThrow();
  });
  it('rechaza periodos invertidos o fuera del congreso', () => {
    expect(() => validate('2026-08-12', '2026-08-10')).toThrow(
      BadRequestException,
    );
    expect(() => validate('2026-08-09', '2026-08-11')).toThrow(
      BadRequestException,
    );
    expect(() => validate('2026-08-11', '2026-08-13')).toThrow(
      BadRequestException,
    );
  });
});
