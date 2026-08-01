import { Injectable } from '@nestjs/common';
import { HealthCheckResponseDto } from '../presenter/dtos/health-check.dto';

@Injectable()
export class HealthCheckUsecase {
  execute(): Promise<HealthCheckResponseDto> {
    return Promise.resolve({ status: 'healthy' });
  }
}
