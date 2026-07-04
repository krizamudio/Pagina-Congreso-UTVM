import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { ExternosService } from './externos.service';
import { CreateExternoDto } from './dto/create-externo.dto';
import { UpdateExternoDto } from './dto/update-externo.dto';

function normalizarDias(
  dias: string | string[] | undefined,
): string[] {
  if (!dias) {
    return [];
  }

  if (Array.isArray(dias)) {
    return dias;
  }

  try {
    const diasParseados = JSON.parse(dias);

    if (Array.isArray(diasParseados)) {
      return diasParseados;
    }
  } catch {
    return [dias];
  }

  return [dias];
}

@Controller('externos')
export class ExternosController {
  constructor(
    private readonly externosService: ExternosService,
  ) {}

  @Get('verificar-correo/:token')
  async verificarCorreo(
    @Param('token') token: string,
    @Res() res: Response,
  ) {
    const frontendUrl =
      process.env.FRONTEND_URL || 'http://localhost:9000';

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
    FileInterceptor('comprobante', {
      storage: memoryStorage(),

      fileFilter: (req, file, callback) => {
        const tiposPermitidos = [
          'application/pdf',
          'image/jpeg',
          'image/jpg',
          'image/png',
        ];

        if (!tiposPermitidos.includes(file.mimetype)) {
          return callback(
            new BadRequestException(
              'Formato no válido. Solo PDF, JPG o PNG.',
            ),
            false,
          );
        }

        callback(null, true);
      },

      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Debes adjuntar un comprobante.',
      );
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

    return this.externosService.create(
      createExternoDto,
      file,
    );
  }

  @Get()
  findAll() {
    return this.externosService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
  ) {
    return this.externosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateExternoDto: UpdateExternoDto,
  ) {
    return this.externosService.update(id, updateExternoDto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
  ) {
    return this.externosService.remove(id);
  }
}