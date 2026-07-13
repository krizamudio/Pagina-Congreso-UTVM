import { Module } from '@nestjs/common';
import { ValidadorCommon } from './validador.provider';
import { GeneradorCommon } from './generador.common';
import { DatabaseErrorHandlerService } from './database/handle-database-error';

@Module({
  providers: [ValidadorCommon, GeneradorCommon, DatabaseErrorHandlerService],
  exports: [ValidadorCommon, GeneradorCommon, DatabaseErrorHandlerService],
})
export class CommonModule {}
