import { Global, Module } from '@nestjs/common';
import { SerialQueue } from './serial-queue';

@Global()
@Module({
  providers: [SerialQueue],
  exports: [SerialQueue],
})
export class ConcurrencyModule {}
