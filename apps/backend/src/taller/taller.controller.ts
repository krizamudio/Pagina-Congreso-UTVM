import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TallerService } from './taller.service';
import { CreateTallerDto } from './dto/create-taller.dto';
import { UpdateTallerDto } from './dto/update-taller.dto';

@Controller('taller')
export class TallerController {
  constructor(private readonly tallerService: TallerService) {}

  @Post()
  create(@Body() createTallerDto: CreateTallerDto) {
    return this.tallerService.createTaller(createTallerDto);
  }

  @Get()
  findAll() {
    return this.tallerService.findAllTalleres();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tallerService.findOneTaller(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTallerDto: UpdateTallerDto) {
    return this.tallerService.updateTaller(id, updateTallerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tallerService.removeConferencia(id);
  }
}
