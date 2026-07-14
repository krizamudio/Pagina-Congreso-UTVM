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
import { PonenteService } from './services/ponente.service';
import { CreatePonenteDto } from './dto/create-ponente.dto';
import { UpdatePonenteDto } from './dto/update-ponente.dto';
import { ResponsePonenteDto } from './dto/response-ponente.dto';

@Controller('ponente')
export class PonenteController {
  constructor(private readonly ponenteService: PonenteService) {}

  @Post()
  create(
    @Body() createPonenteDto: CreatePonenteDto,
  ): Promise<ResponsePonenteDto> {
    return this.ponenteService.createPonente(createPonenteDto);
  }

  @Get()
  findAll() {
    return this.ponenteService.findAllPonente();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ponenteService.findOnePonente(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePonenteDto: UpdatePonenteDto,
  ): Promise<string> {
    return this.ponenteService.updatePonente(id, updatePonenteDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.ponenteService.removePonente(id);
  }
}
