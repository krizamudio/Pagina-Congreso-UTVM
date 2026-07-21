import { ParticipanteTipo } from '../participante-acceso/participante-tipo.enum';
import { InscripcionTallerService as TallerInscripcionService } from '../taller/services/inscripcion-taller.service';
import { InscripcionTallerService } from './inscripcion-taller.service';

describe('InscripcionTallerService', () => {
  it('delega la inscripción y conserva la respuesta del endpoint público', async () => {
    const create = jest.fn().mockResolvedValue({
      id: 'inscripcion-id',
      taller: { id: 'taller-id', titulo: 'Taller de prueba' },
      created_at: new Date('2026-07-20T12:00:00.000Z'),
    });
    const service = new InscripcionTallerService({
      create,
    } as unknown as TallerInscripcionService);

    await expect(
      service.inscribir({
        tallerId: 'taller-id',
        participanteId: 'participante-id',
        tipoParticipante: ParticipanteTipo.EXTERNO,
      }),
    ).resolves.toEqual({
      mensaje: 'Inscripción realizada correctamente.',
      inscripcion: {
        id: 'inscripcion-id',
        tallerId: 'taller-id',
        taller: 'Taller de prueba',
        participanteId: 'participante-id',
        tipoParticipante: ParticipanteTipo.EXTERNO,
        fechaInscripcion: new Date('2026-07-20T12:00:00.000Z'),
      },
    });
    expect(create).toHaveBeenCalledWith('taller-id', {
      tipoParticipante: ParticipanteTipo.EXTERNO,
      referenciaId: 'participante-id',
    });
  });
});
