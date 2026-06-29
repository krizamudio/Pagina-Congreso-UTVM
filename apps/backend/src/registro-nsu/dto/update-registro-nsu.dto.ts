import { PartialType } from '@nestjs/mapped-types';
import { CreateRegistroNsuDto } from './create-registro-nsu.dto';

export class UpdateRegistroNsuDto extends PartialType(CreateRegistroNsuDto) {}
