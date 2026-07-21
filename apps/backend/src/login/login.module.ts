import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Externo } from '../externos/entities/externo.entity';
import { ParticipanteNsu } from '../registro-nsu/entities/participante-nsu.entity';
import { Ems } from '../ems/entities/ems.entity';
import { Utvm } from '../utvm/entities/utvm.entity';

import { LoginController } from './login.controller';
import { LoginService } from './login.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Externo,
      ParticipanteNsu,
      Ems,
      Utvm,
    ]),
  ],
  controllers: [LoginController],
  providers: [LoginService],
})
export class LoginModule {}