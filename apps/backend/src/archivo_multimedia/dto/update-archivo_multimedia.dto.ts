import { PartialType } from '@nestjs/mapped-types';
import { CreateArchivoMultimediaDto } from './create-archivo_multimedia.dto';

export class UpdateArchivoMultimediaDto extends PartialType(CreateArchivoMultimediaDto) {}
