import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Externo } from '../externos/entities/externo.entity';
import { ParticipanteNsu } from '../registro-nsu/entities/participante-nsu.entity';

import { LoginController } from './login.controller';
import { LoginService } from './login.service';

@Module({
  imports: [TypeOrmModule.forFeature([Externo, ParticipanteNsu])],
  controllers: [LoginController],
  providers: [LoginService],
})
export class LoginModule {}
