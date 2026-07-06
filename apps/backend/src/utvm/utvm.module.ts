import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Utvm } from './entities/utvm.entity';
import { UtvmService } from './utvm.service';
import { UtvmController } from './utvm.controller';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([Utvm]), CommonModule],
  controllers: [UtvmController],
  providers: [UtvmService],
})
export class UtvmModule {}
