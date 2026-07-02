import { Module } from '@nestjs/common';
import { ValidadorCommon } from './validador.common';
import { GeneradorCommon } from './generador.common';

@Module({
  providers: [ValidadorCommon, GeneradorCommon],
  exports: [ValidadorCommon, GeneradorCommon],
})
export class CommonModule {}
