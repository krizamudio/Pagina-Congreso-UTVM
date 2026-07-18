import { PartialType } from '@nestjs/mapped-types';

import { CreateForoEmpresarialDto } from './create-foro-empresarial.dto';

export class UpdateForoEmpresarialDto extends PartialType(
  CreateForoEmpresarialDto,
) {}
