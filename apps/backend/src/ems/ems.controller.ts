import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { EmsService } from './ems.service';
import { CreateEmsDto } from './dto/create-ems.dto';
import { UpdateEmsDto } from './dto/update-ems.dto';
import { EnviarQrAccesoDto } from '../participante-qr/dto/enviar-qr-acceso.dto';

@Controller('ems')
export class EmsController {
  constructor(private readonly emsService: EmsService) {}

  @Post()
  create(@Body() createEmsDto: CreateEmsDto) {
    return this.emsService.create(createEmsDto);
  }

  @Post('multiple')
  createMany(@Body() participantes: CreateEmsDto[]) {
    return this.emsService.createMany(participantes);
  }

  @Post(':id/qr-acceso/enviar')
  enviarQrAcceso(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: EnviarQrAccesoDto,
  ) {
    return this.emsService.enviarQrAcceso(id, dto);
  }

  @Post(':id/qr-acceso/enviar-automatico')
  enviarQrAccesoAutomatico(@Param('id', ParseIntPipe) id: number) {
    return this.emsService.enviarQrAccesoAutomatico(id);
  }

  @Get()
  findAll() {
    return this.emsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.emsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEmsDto: UpdateEmsDto) {
    return this.emsService.update(+id, updateEmsDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.emsService.remove(+id);
  }

  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.emsService.restore(+id);
  }
}
