import { BadRequestException, Logger } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

import { DatabaseErrorHandlerService } from './handle-database-error';

describe('DatabaseErrorHandlerService', () => {
  const service = new DatabaseErrorHandlerService();

  beforeAll(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it.each([
    ['22001', 'texto'],
    ['22003', 'numérico'],
  ])('convierte el error PostgreSQL %s en 400', (code, expectedMessage) => {
    expect.assertions(2);
    const error = new QueryFailedError('INSERT', [], { code });

    try {
      service.handle(error);
    } catch (caught) {
      expect(caught).toBeInstanceOf(BadRequestException);
      expect((caught as BadRequestException).message).toContain(
        expectedMessage,
      );
    }
  });
});
