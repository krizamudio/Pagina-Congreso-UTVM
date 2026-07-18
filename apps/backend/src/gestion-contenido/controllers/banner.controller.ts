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

import { BannerResponseDto } from '../dto/banner-response.dto';
import { CreateBannerDto } from '../dto/create-banner.dto';
import { UpdateBannerDto } from '../dto/update-banner.dto';
import { BannerService } from '../services/banner.service';

// TODO: Restringir estos endpoints al administrador autenticado.
@Controller('gestion-contenido/banners')
export class BannerController {
  constructor(private readonly service: BannerService) {}

  @Post()
  create(@Body() dto: CreateBannerDto): Promise<BannerResponseDto> {
    return this.service.create(dto);
  }

  @Get()
  findAll(): Promise<BannerResponseDto[]> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<BannerResponseDto> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBannerDto,
  ): Promise<BannerResponseDto> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<string> {
    return this.service.remove(id);
  }
}
