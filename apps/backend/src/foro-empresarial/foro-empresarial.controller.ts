import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { CreateForoEmpresarialDto } from './dto/create-foro-empresarial.dto';
import { ForoEmpresarialResponseDto } from './dto/foro-empresarial-response.dto';
import { UpdateForoEmpresarialDto } from './dto/update-foro-empresarial.dto';
import { ForoEmpresarialService } from './services/foro-empresarial.service';

@Controller('foro-empresarial')
export class ForoEmpresarialController {
  constructor(private readonly service: ForoEmpresarialService) {}

  @Post()
  create(
    @Body() dto: CreateForoEmpresarialDto,
  ): Promise<ForoEmpresarialResponseDto> {
    return this.service.create(dto);
  }

  @Get()
  findAll(): Promise<ForoEmpresarialResponseDto[]> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ForoEmpresarialResponseDto> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateForoEmpresarialDto,
  ): Promise<ForoEmpresarialResponseDto> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<string> {
    return this.service.remove(id);
  }
}
