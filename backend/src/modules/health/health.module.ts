import { Module } from '@nestjs/common';
import { HealthController } from './presenter/health.controller';
import { HealthCheckUsecase } from './usecases/health-check.usecase';

@Module({
  controllers: [HealthController],
  providers: [HealthCheckUsecase],
})
export class HealthModule {}
