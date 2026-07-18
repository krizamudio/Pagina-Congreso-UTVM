import { BadRequestException } from '@nestjs/common';

export function validatePatch(
  dto: object,
  nonNullableFields: readonly string[],
): void {
  if (Object.keys(dto).length === 0) {
    throw new BadRequestException(
      'Debe proporcionar al menos un campo para actualizar',
    );
  }

  const values = dto as Record<string, unknown>;
  if (nonNullableFields.some((field) => values[field] === null)) {
    throw new BadRequestException(
      'Los campos obligatorios no pueden establecerse en null',
    );
  }
}
