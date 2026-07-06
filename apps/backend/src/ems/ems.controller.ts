import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { EmsService } from './ems.service';
import { CreateEmsDto } from './dto/create-ems.dto';
import { UpdateEmsDto } from './dto/update-ems.dto';

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
}
