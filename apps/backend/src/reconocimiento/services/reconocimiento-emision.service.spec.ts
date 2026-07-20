/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { ReconocimientoTipo } from '../enums/reconocimiento-tipo.enum';
import { ReconocimientoEmisionService } from './reconocimiento-emision.service';

function queryBuilder(result: unknown[]) {
  return {
    innerJoinAndSelect: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue(result),
  };
}

describe('ReconocimientoEmisionService', () => {
  const congreso = { id: 'congreso-1' };
  const ponente = { id: 'ponente-1', nombre: 'Dra. Ada Lovelace' };
  const taller = { id: 'taller-1', congreso, ponente };
  const conferencia = { id: 'conferencia-1', congreso, ponente };
  const participante = {
    id: 'participante-1',
    tipo: 'UTVM',
    referencia_id: '7',
  };

  function setup(talleres: unknown[], conferencias: unknown[]) {
    const orIgnore = jest.fn().mockReturnThis();
    const execute = jest.fn().mockResolvedValue(undefined);
    const insert = jest.fn().mockReturnThis();
    const values = jest.fn().mockReturnThis();
    const reconocimientos = {
      createQueryBuilder: jest.fn(() => ({
        insert,
        values,
        orIgnore,
        execute,
      })),
    };
    const tallerRepository = {
      createQueryBuilder: jest.fn(() => queryBuilder(talleres)),
    };
    const conferenciaRepository = {
      createQueryBuilder: jest.fn(() => queryBuilder(conferencias)),
    };
    const inscripciones = {
      find: jest
        .fn()
        .mockResolvedValue([{ id: 'inscripcion-1', participante }]),
    };
    const resolver = {
      resolve: jest.fn().mockResolvedValue({ nombreCompleto: 'José Pérez' }),
    };
    const service = new ReconocimientoEmisionService(
      reconocimientos as never,
      tallerRepository as never,
      conferenciaRepository as never,
      inscripciones as never,
      resolver as never,
    );
    return { service, values, orIgnore };
  }

  it('no crea registros si la consulta no devuelve actividades finalizadas', async () => {
    const { service, values } = setup([], []);
    await service.prepareFinishedActivities();
    expect(values).not.toHaveBeenCalled();
  });

  it('prepara participante, tallerista y conferencista con claves independientes', async () => {
    const { service, values, orIgnore } = setup([taller], [conferencia]);
    await service.prepareFinishedActivities();

    const emitted = values.mock.calls.map(([value]) => value);
    expect(emitted).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          clave_emision: 'taller:taller-1:participante:participante-1',
          tipo: ReconocimientoTipo.GENERAL,
        }),
        expect.objectContaining({
          clave_emision: 'taller:taller-1:ponente:ponente-1',
          tipo: ReconocimientoTipo.TALLERISTA,
        }),
        expect.objectContaining({
          clave_emision: 'conferencia:conferencia-1:ponente:ponente-1',
          tipo: ReconocimientoTipo.CONFERENCISTA,
        }),
      ]),
    );
    expect(orIgnore).toHaveBeenCalledTimes(3);
  });

  it('mantiene la misma clave y usa insert-or-ignore en ejecuciones repetidas', async () => {
    const { service, values, orIgnore } = setup([taller], []);
    await service.prepareFinishedActivities();
    await service.prepareFinishedActivities();

    const keys = values.mock.calls.map(([value]) => value.clave_emision);
    expect(new Set(keys).size).toBe(2);
    expect(orIgnore).toHaveBeenCalledTimes(4);
  });
});
