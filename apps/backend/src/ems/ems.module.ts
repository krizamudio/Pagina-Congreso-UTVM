import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Ems } from './entities/ems.entity';
import { EmsController } from './ems.controller';
import { EmsService } from './ems.service';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([Ems]), CommonModule],
  controllers: [EmsController],
  providers: [EmsService],
})
export class EmsModule {}
