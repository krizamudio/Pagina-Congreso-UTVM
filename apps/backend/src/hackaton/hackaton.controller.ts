import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { CreateHackatonDto } from './dto/create-hackaton.dto';
import { CreateEquipoDto, UpdateEquipoDto } from './dto/equipo.dto';
import { ReemplazarEvaluadoresDto } from './dto/evaluadores.dto';
import { FindElegiblesDto } from './dto/find-elegibles.dto';
import { FindHackatonDto } from './dto/find-hackaton.dto';
import { AsignarResultadoDto } from './dto/resultado.dto';
import { UpdateHackatonDto } from './dto/update-hackaton.dto';
import { HackatonElegiblesService } from './services/hackaton-elegibles.service';
import { HackatonEquiposService } from './services/hackaton-equipos.service';
import { HackatonEvaluadoresService } from './services/hackaton-evaluadores.service';
import { HackatonReconocimientosService } from './services/hackaton-reconocimientos.service';
import { HackatonService } from './services/hackaton.service';

@Controller('hackatones')
export class HackatonController {
  constructor(
    private readonly service: HackatonService,
    private readonly evaluadores: HackatonEvaluadoresService,
    private readonly equipos: HackatonEquiposService,
    private readonly elegibles: HackatonElegiblesService,
    private readonly reconocimientos: HackatonReconocimientosService,
  ) {}
  @Post() create(@Body() dto: CreateHackatonDto) {
    return this.service.create(dto);
  }
  @Get() findAll(@Query() query: FindHackatonDto) {
    return this.service.findAll(query);
  }
  @Get(':id') findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }
  @Patch(':id') update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateHackatonDto,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id') @HttpCode(204) remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
  @Get(':id/participantes-elegibles') elegible(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: FindElegiblesDto,
  ) {
    return this.elegibles.find(id, query);
  }
  @Put(':id/evaluadores') replaceEvaluators(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReemplazarEvaluadoresDto,
  ) {
    return this.evaluadores.replace(id, dto);
  }
  @Get(':id/equipos') teams(@Param('id', ParseUUIDPipe) id: string) {
    return this.equipos.findAll(id);
  }
  @Post(':id/equipos') createTeam(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateEquipoDto,
  ) {
    return this.equipos.create(id, dto);
  }
  @Get(':hackatonId/equipos/:equipoId') team(
    @Param('hackatonId', ParseUUIDPipe) hid: string,
    @Param('equipoId', ParseUUIDPipe) eid: string,
  ) {
    return this.equipos.findOne(hid, eid);
  }
  @Put(':hackatonId/equipos/:equipoId') updateTeam(
    @Param('hackatonId', ParseUUIDPipe) hid: string,
    @Param('equipoId', ParseUUIDPipe) eid: string,
    @Body() dto: UpdateEquipoDto,
  ) {
    return this.equipos.update(hid, eid, dto);
  }
  @Delete(':hackatonId/equipos/:equipoId') @HttpCode(204) deleteTeam(
    @Param('hackatonId', ParseUUIDPipe) hid: string,
    @Param('equipoId', ParseUUIDPipe) eid: string,
  ) {
    return this.equipos.remove(hid, eid);
  }
  @Put(':hackatonId/equipos/:equipoId/resultado') result(
    @Param('hackatonId', ParseUUIDPipe) hid: string,
    @Param('equipoId', ParseUUIDPipe) eid: string,
    @Body() dto: AsignarResultadoDto,
  ) {
    return this.equipos.assignResult(hid, eid, dto);
  }
  @Post(':id/reconocimientos/evaluadores/zip') async evaluatorZip(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const out = await this.reconocimientos.evaluadoresZip(id);
    res.type('application/zip').attachment(out.filename).send(out.zip);
  }
  @Post(':hackatonId/equipos/:equipoId/reconocimientos/zip') async teamZip(
    @Param('hackatonId', ParseUUIDPipe) hid: string,
    @Param('equipoId', ParseUUIDPipe) eid: string,
    @Res() res: Response,
  ) {
    const out = await this.reconocimientos.equipoZip(hid, eid);
    res.type('application/zip').attachment(out.filename).send(out.zip);
  }
}
