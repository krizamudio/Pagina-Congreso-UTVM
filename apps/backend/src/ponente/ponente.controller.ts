import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { PonenteService } from './services/ponente.service';
import { CreatePonenteDto } from './dto/create-ponente.dto';
import { UpdatePonenteDto } from './dto/update-ponente.dto';
import { ResponsePonenteDto } from './dto/response-ponente.dto';
import { FindPonenteDto } from './dto/find-ponente.dto';

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
  findAll(@Query() query: FindPonenteDto) {
    return this.ponenteService.findAllPonente(query);
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
