import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  ParseFilePipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { RegistroNsuService } from './registro-nsu.service';

import type { UploadedFile as UploadedFileType } from './types/uploaded-file.type';
import { UpdateRegistroNsuDto } from './dto/update-registro-nsu.dto';
import { UpdateParticipanteNsuStatusDto } from './dto/update-participante-nsu-status.dto';
import type { CreateParticipanteNsuDto } from './dto/create-registro-nsu.dto';
import { EnviarQrAccesoDto } from '../participante-qr/dto/enviar-qr-acceso.dto';

@Controller('registro-nsu')
export class RegistroNsuController {
  constructor(private readonly registroNsuService: RegistroNsuService) {}

  @Get('verificar-correo/:token')
  verificarCorreo(@Param('token') token: string) {
    return this.registroNsuService.verificarCorreoParticipante(token);
  }

  @Post()
  @UseInterceptors(FileInterceptor('comprobante'))
  create(
    @Body('participantes') participantes: string | CreateParticipanteNsuDto[],
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [
          new MaxFileSizeValidator({
            maxSize: 10 * 1024 * 1024,
          }),
          new FileTypeValidator({
            fileType: /(pdf|jpg|jpeg|png)$/i,
          }),
        ],
      }),
    )
    comprobante: UploadedFileType,
  ) {
    let participantesParseados: CreateParticipanteNsuDto[];

    try {
      participantesParseados =
        typeof participantes === 'string'
          ? (JSON.parse(participantes) as CreateParticipanteNsuDto[])
          : participantes;
    } catch {
      throw new BadRequestException(
        'El campo participantes no tiene un formato JSON válido.',
      );
    }

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

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRegistroNsuDto: UpdateRegistroNsuDto,
  ) {
    return this.registroNsuService.update(id, updateRegistroNsuDto);
  }

  @Patch(':id/participantes/:participanteId')
  updateParticipanteStatus(
    @Param('id') id: string,
    @Param('participanteId') participanteId: string,
    @Body() updateParticipanteNsuStatusDto: UpdateParticipanteNsuStatusDto,
  ) {
    return this.registroNsuService.updateParticipanteStatus(
      id,
      participanteId,
      updateParticipanteNsuStatusDto,
    );
  }

  @Post(':id/participantes/:participanteId/qr-acceso/enviar')
  enviarQrAcceso(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('participanteId', ParseUUIDPipe) participanteId: string,
    @Body() dto: EnviarQrAccesoDto,
  ) {
    return this.registroNsuService.enviarQrAcceso(id, participanteId, dto);
  }

  @Post(':id/participantes/:participanteId/qr-acceso/enviar-automatico')
  enviarQrAccesoAutomatico(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('participanteId', ParseUUIDPipe) participanteId: string,
  ) {
    return this.registroNsuService.enviarQrAccesoAutomatico(id, participanteId);
  }

  @Delete(':id/participantes/:participanteId')
  removeParticipante(
    @Param('id') id: string,
    @Param('participanteId') participanteId: string,
  ) {
    return this.registroNsuService.removeParticipante(id, participanteId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.registroNsuService.remove(id);
  }

  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.registroNsuService.restore(id);
  }
}
