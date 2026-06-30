import { PartialType } from '@nestjs/mapped-types';
import { CreateEmsDto } from './create-ems.dto';

export class UpdateEmsDto extends PartialType(CreateEmsDto) {}
