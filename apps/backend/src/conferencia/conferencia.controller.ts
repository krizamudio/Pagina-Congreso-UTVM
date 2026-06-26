import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ConferenciasService } from './conferencia.service';
import { CreateConferenciaDto } from './dto/create-conferencia.dto';
import { UpdateConferenciaDto } from './dto/update-conferencia.dto';

@Controller('conferencias')
export class ConferenciasController {
  constructor(private readonly conferenciasService: ConferenciasService) {}

  @Post()
  create(@Body() createConferenciaDto: CreateConferenciaDto) {
    return this.conferenciasService.create(createConferenciaDto);
  }

  @Get()
  findAllConferencias() {
    return this.conferenciasService.findAllConferencias();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.conferenciasService.findOneConferencia(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateConferenciaDto: UpdateConferenciaDto,
  ) {
    return this.conferenciasService.update(id, updateConferenciaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.conferenciasService.remove(id);
  }
}
