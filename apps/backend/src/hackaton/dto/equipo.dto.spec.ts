import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateEquipoDto } from './equipo.dto';

describe('CreateEquipoDto', () => {
  const ids = Array.from(
    { length: 11 },
    (_, index) => `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`,
  );
  it('acepta entre uno y diez integrantes únicos', async () => {
    expect(
      await validate(
        plainToInstance(CreateEquipoDto, {
          nombre: 'Bit Force',
          participante_ids: ids.slice(0, 10),
        }),
      ),
    ).toHaveLength(0);
  });
  it('rechaza equipos vacíos, mayores a diez o repetidos', async () => {
    await expect(
      validate(
        plainToInstance(CreateEquipoDto, { nombre: 'A', participante_ids: [] }),
      ),
    ).resolves.not.toHaveLength(0);
    await expect(
      validate(
        plainToInstance(CreateEquipoDto, {
          nombre: 'A',
          participante_ids: ids,
        }),
      ),
    ).resolves.not.toHaveLength(0);
    await expect(
      validate(
        plainToInstance(CreateEquipoDto, {
          nombre: 'A',
          participante_ids: [ids[0], ids[0]],
        }),
      ),
    ).resolves.not.toHaveLength(0);
  });
});
