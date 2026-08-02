import { Inject, Injectable } from '@nestjs/common';
import { IStepEventRepository } from '../ports/output/step-event-repository.port';
import { StepEventEntity } from '../../shared/domain/entities/step-event.entity';

@Injectable()
export class GetStepEventsUsecase {
  constructor(
    @Inject(IStepEventRepository) private readonly stepEventRepo: IStepEventRepository,
  ) {}

  execute(stepId: string): Promise<StepEventEntity[]> {
    return this.stepEventRepo.findByStep(stepId);
  }
}
