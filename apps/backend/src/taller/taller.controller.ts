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
import { TallerService } from './services/taller.service';
import { CreateTallerDto } from './dto/create-taller.dto';
import { UpdateTallerDto } from './dto/update-taller.dto';

// TODO: Restringir las mutaciones al administrador autenticado.
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
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tallerService.findOneTaller(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTallerDto: UpdateTallerDto,
  ) {
    return this.tallerService.updateTaller(id, updateTallerDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tallerService.removeTaller(id);
  }
}
