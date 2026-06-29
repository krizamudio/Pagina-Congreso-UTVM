import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { RegistroNsuService } from './registro-nsu.service';

import type { UploadedFile as UploadedFileType } from './types/uploaded-file.type';
import type { CreateParticipanteNsuDto } from './dto/create-registro-nsu.dto';

@Controller('registro-nsu')
export class RegistroNsuController {
  constructor(private readonly registroNsuService: RegistroNsuService) {}

  @Post()
  @UseInterceptors(FileInterceptor('comprobante'))
  create(
    @Body('participantes') participantes: string | CreateParticipanteNsuDto[],
    @UploadedFile() comprobante: UploadedFileType,
  ) {
    const participantesParseados =
      typeof participantes === 'string'
        ? (JSON.parse(participantes) as CreateParticipanteNsuDto[])
        : participantes;

    return this.registroNsuService.create({
      participantes: participantesParseados,
      comprobante,
    });
  }
  @Get()
  findAll() {
    return this.registroNsuService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.registroNsuService.findOne(id);
  }
}
