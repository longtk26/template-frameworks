import { Global, Module } from '@nestjs/common';
import { db } from './drizzle-client';

export const DRIZZLE = Symbol('DRIZZLE');

@Global()
@Module({
  providers: [{ provide: DRIZZLE, useValue: db }],
  exports: [DRIZZLE],
})
export class DatabaseModule {}
