import { Module } from '@nestjs/common';
import { ValidadorCommon } from './validador.common';

@Module({
  providers: [ValidadorCommon],
  exports: [ValidadorCommon],
})
export class CommonModule {}
