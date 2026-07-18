import { PartialType } from '@nestjs/mapped-types';

import { CreateSeccionContenidoDto } from './create-seccion-contenido.dto';

export class UpdateSeccionContenidoDto extends PartialType(
  CreateSeccionContenidoDto,
) {}
