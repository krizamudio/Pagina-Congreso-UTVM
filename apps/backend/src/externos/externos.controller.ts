import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

import { ExternosService } from './externos.service';
import { CreateExternoDto } from './dto/create-externo.dto';
import { UpdateExternoDto } from './dto/update-externo.dto';

const uploadPath = join(
  process.cwd(),
  'uploads',
  'comprobantes',
  'externos',
);

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

  @Post()
  @UseInterceptors(
    FileInterceptor('comprobante', {
      storage: diskStorage({
        destination: (req, file, callback) => {
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, {
              recursive: true,
            });
          }

          callback(null, uploadPath);
        },

        filename: (req, file, callback) => {
          const extension = extname(file.originalname);
          const nombreArchivo =
            `comprobante-${Date.now()}${extension}`;

          callback(null, nombreArchivo);
        },
      }),

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
  create(
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
      apellidoMaterno: body.apellidoMaterno || '',
      correo: body.correo,
      telefono: body.telefono,
      institucion: body.institucion,
      dias: normalizarDias(body.dias),
      total: Number(body.total),
      comprobante: `uploads/comprobantes/externos/${file.filename}`,
    };

    return this.externosService.create(createExternoDto);
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