import { PartialType } from '@nestjs/mapped-types';
import { CreateUtvmDto } from './create-utvm.dto';

export class UpdateUtvmDto extends PartialType(CreateUtvmDto) {}
