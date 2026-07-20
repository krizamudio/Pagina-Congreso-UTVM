import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

import { ExternosService } from './externos.service';
import { CreateExternoDto } from './dto/create-externo.dto';
import { UpdateExternoDto } from './dto/update-externo.dto';
import { EnviarQrAccesoDto } from '../participante-qr/dto/enviar-qr-acceso.dto';
import {
  ARCHIVO_UPLOAD_OPTIONS,
  ArchivoConcurrencyInterceptor,
  crearPipeArchivo,
} from '../archivo_multimedia/services';

function normalizarDias(dias: string | string[] | undefined): string[] {
  if (!dias) {
    return [];
  }

  if (Array.isArray(dias)) {
    return dias;
  }

  try {
    const diasParseados: unknown = JSON.parse(dias);

    if (Array.isArray(diasParseados)) {
      return diasParseados.filter(
        (dia: unknown): dia is string => typeof dia === 'string',
      );
    }
  } catch {
    return [dias];
  }

  return [dias];
}

interface ExternoMultipartBody {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  correo: string;
  telefono: string;
  institucion?: string;
  dias?: string | string[];
  total: string | number;
}

@Controller('externos')
export class ExternosController {
  constructor(private readonly externosService: ExternosService) {}

  @Get('verificar-correo/:token')
  async verificarCorreo(@Param('token') token: string, @Res() res: Response) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:9000';

    try {
      await this.externosService.verificarCorreo(token);

      return res.redirect(
        `${frontendUrl}/#/registro-externo?registro=verificado`,
      );
    } catch (error) {
      const mensaje =
        error instanceof Error
          ? error.message
          : 'No se pudo verificar el correo.';

      return res.redirect(
        `${frontendUrl}/#/registro-externo?registro=error&mensaje=${encodeURIComponent(mensaje)}`,
      );
    }
  }

  @Post()
  @UseInterceptors(
    ArchivoConcurrencyInterceptor,
    FileInterceptor('comprobante', ARCHIVO_UPLOAD_OPTIONS),
  )
  async create(
    @UploadedFile(crearPipeArchivo('comprobantes'))
    file: Express.Multer.File,
    @Body() body: ExternoMultipartBody,
  ) {
    if (!file) {
      throw new BadRequestException('Debes adjuntar un comprobante.');
    }

    const createExternoDto: CreateExternoDto = {
      nombre: body.nombre,
      apellidoPaterno: body.apellidoPaterno,
      apellidoMaterno: body.apellidoMaterno || null,
      correo: body.correo,
      telefono: body.telefono,
      institucion: body.institucion || null,
      dias: normalizarDias(body.dias),
      total: Number(body.total),
    };

    return this.externosService.create(createExternoDto, file);
  }

  @Get()
  findAll() {
    return this.externosService.findAll();
  }

  @Post(':id/qr-acceso/enviar')
  enviarQrAcceso(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: EnviarQrAccesoDto,
  ) {
    return this.externosService.enviarQrAcceso(id, dto);
  }

  @Post(':id/qr-acceso/enviar-automatico')
  enviarQrAccesoAutomatico(@Param('id', ParseUUIDPipe) id: string) {
    return this.externosService.enviarQrAccesoAutomatico(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.externosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateExternoDto: UpdateExternoDto,
  ) {
    return this.externosService.update(id, updateExternoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.externosService.remove(id);
  }

  @Patch(':id/restore')
  restore(@Param('id', ParseUUIDPipe) id: string) {
    return this.externosService.restore(id);
  }
}
