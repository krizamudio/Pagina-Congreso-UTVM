import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PonenteService } from './ponente.service';
import { CreatePonenteDto } from './dto/create-ponente.dto';
import { UpdatePonenteDto } from './dto/update-ponente.dto';

@Controller('ponente')
export class PonenteController {
  constructor(private readonly ponenteService: PonenteService) {}

  @Post()
  create(@Body() createPonenteDto: CreatePonenteDto) {
    return this.ponenteService.createPonente(createPonenteDto);
  }

  @Get()
  findAll() {
    return this.ponenteService.findAllPonente();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ponenteService.findOnePonente(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePonenteDto: UpdatePonenteDto) {
    return this.ponenteService.updatePonente(id, updatePonenteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ponenteService.removePonente(id);
  }
}
