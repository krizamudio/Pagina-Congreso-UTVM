import { PartialType } from '@nestjs/mapped-types';
import { CreateCongresoDto } from './create-congreso.dto';

export class UpdateCongresoDto extends PartialType(CreateCongresoDto) {}
