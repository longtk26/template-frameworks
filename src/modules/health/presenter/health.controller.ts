import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HealthCheckUsecase } from '../usecases/health-check.usecase';
import { HealthCheckResponseDto } from './dtos/health-check.dto';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthCheckUsecase: HealthCheckUsecase) {}

  @Get()
  check(): Promise<HealthCheckResponseDto> {
    return this.healthCheckUsecase.execute();
  }
}
