import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CongresoService } from './congreso.service';
import { CreateCongresoDto } from './dto/create-congreso.dto';
import { UpdateCongresoDto } from './dto/update-congreso.dto';

@Controller('congreso')
export class CongresoController {
  constructor(private readonly congresoService: CongresoService) {}

  @Post()
  create(@Body() createCongresoDto: CreateCongresoDto) {
    return this.congresoService.create(createCongresoDto);
  }

  @Get()
  findAll() {
    return this.congresoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.congresoService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCongresoDto: UpdateCongresoDto,
  ) {
    return this.congresoService.update(id, updateCongresoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.congresoService.remove(id);
  }
}
