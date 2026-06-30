import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Utvm } from './entities/utvm.entity';
import { UtvmService } from './utvm.service';
import { UtvmController } from './utvm.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Utvm])],
  controllers: [UtvmController],
  providers: [UtvmService],
})
export class UtvmModule {}
