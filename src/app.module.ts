import { Module } from '@nestjs/common';
import { EnvModule } from './configs/env.module';
import { DatabaseModule } from './libs/database/database.module';
import { HealthModule } from './modules/health/health.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [EnvModule, DatabaseModule, HealthModule, UsersModule],
})
export class AppModule {}
