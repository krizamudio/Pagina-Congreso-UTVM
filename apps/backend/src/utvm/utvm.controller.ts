import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { UtvmService } from './utvm.service';
import { CreateUtvmDto } from './dto/create-utvm.dto';
import { UpdateUtvmDto } from './dto/update-utvm.dto';

@Controller('utvm')
export class UtvmController {
  constructor(private readonly utvmService: UtvmService) {}

  @Post()
  create(@Body() createUtvmDto: CreateUtvmDto) {
    return this.utvmService.create(createUtvmDto);
  }

  @Post('multiple')
  createMany(@Body() participantes: CreateUtvmDto[]) {
    return this.utvmService.createMany(participantes);
  }

  @Get()
  findAll() {
    return this.utvmService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.utvmService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUtvmDto: UpdateUtvmDto) {
    return this.utvmService.update(+id, updateUtvmDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.utvmService.remove(+id);
  }
}
