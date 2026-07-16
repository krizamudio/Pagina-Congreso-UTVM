import { Module } from '@nestjs/common';
import { ValidadorCommon } from './validador.provider';
import { GeneradorCommon } from './generador.common';
import { DatabaseErrorHandlerService } from './database/handle-database-error';
import { ResourceLockService } from './resource-lock.service';

@Module({
  providers: [
    ValidadorCommon,
    GeneradorCommon,
    DatabaseErrorHandlerService,
    ResourceLockService,
  ],
  exports: [
    ValidadorCommon,
    GeneradorCommon,
    DatabaseErrorHandlerService,
    ResourceLockService,
  ],
})
export class CommonModule {}
