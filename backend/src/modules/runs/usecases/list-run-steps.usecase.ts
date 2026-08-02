import { Inject, Injectable } from '@nestjs/common';
import { IRunStepRepository } from '../ports/output/run-step-repository.port';
import { RunStepEntity } from '../../shared/domain/entities/run-step.entity';

@Injectable()
export class ListRunStepsUsecase {
  constructor(
    @Inject(IRunStepRepository) private readonly runStepRepo: IRunStepRepository,
  ) {}

  execute(runId: string): Promise<RunStepEntity[]> {
    return this.runStepRepo.findAllByRun(runId);
  }
}
