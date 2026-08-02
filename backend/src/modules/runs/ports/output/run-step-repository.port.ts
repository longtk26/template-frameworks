import { RunStepEntity } from '../../../shared/domain/entities/run-step.entity';
import { StepStatus } from '../../../shared/domain/types';

export abstract class IRunStepRepository {
  abstract create(step: RunStepEntity): Promise<RunStepEntity>;
  abstract findById(id: string): Promise<RunStepEntity | null>;
  abstract findAllByRun(runId: string): Promise<RunStepEntity[]>;
  abstract countByRun(runId: string): Promise<number>;
  abstract update(
    id: string,
    changes: Partial<{
      status: StepStatus;
      claudeSessionId: string | null;
      summary: string | null;
      errorMessage: string | null;
      startedAt: Date | null;
      completedAt: Date | null;
    }>,
  ): Promise<RunStepEntity>;
}
