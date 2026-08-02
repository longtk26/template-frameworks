import { PipelineRunEntity } from '../../../shared/domain/entities/pipeline-run.entity';
import { RunStatus } from '../../../shared/domain/types';

export abstract class IRunRepository {
  abstract create(run: PipelineRunEntity): Promise<PipelineRunEntity>;
  abstract findById(id: string): Promise<PipelineRunEntity | null>;
  abstract findAllByProject(projectId: string): Promise<PipelineRunEntity[]>;
  abstract update(
    id: string,
    changes: Partial<{
      status: RunStatus;
      branchName: string | null;
      worktreePath: string | null;
      fixIterationCount: number;
      errorMessage: string | null;
      startedAt: Date | null;
      completedAt: Date | null;
    }>,
  ): Promise<PipelineRunEntity>;
}
