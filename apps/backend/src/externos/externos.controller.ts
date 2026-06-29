import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { ExternosService } from './externos.service';
import { CreateExternoDto } from './dto/create-externo.dto';
import { UpdateExternoDto } from './dto/update-externo.dto';

@Controller('externos')
export class ExternosController {

  constructor(
    private readonly externosService: ExternosService,
  ) {}

  @Post()
  create(
    @Body() createExternoDto: CreateExternoDto,
  ) {
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