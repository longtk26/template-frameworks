import { ApprovePlanReviewUsecase } from './approve-plan-review.usecase';
import { IRunRepository } from '../ports/output/run-repository.port';
import { IReviewCheckpointRepository } from '../ports/output/review-checkpoint-repository.port';
import { RunOrchestratorService } from '../infrastructure/orchestration/run-orchestrator.service';
import { PipelineRunEntity } from '../../shared/domain/entities/pipeline-run.entity';
import { ReviewCheckpointEntity } from '../../shared/domain/entities/review-checkpoint.entity';

describe('ApprovePlanReviewUsecase', () => {
  function makeRun(status: PipelineRunEntity['status']) {
    return new PipelineRunEntity({
      id: 'run-1',
      projectId: 'project-1',
      title: 'Add dark mode',
      requestDescription: 'Add a dark mode toggle',
      status,
    });
  }

  it('approves the pending checkpoint, moves the run to designing, and kicks off advance()', async () => {
    const checkpoint = new ReviewCheckpointEntity({
      id: 'checkpoint-1',
      runId: 'run-1',
      kind: 'plan_review',
    });
    const runRepo: jest.Mocked<IRunRepository> = {
      create: jest.fn(),
      findById: jest.fn().mockResolvedValue(makeRun('awaiting_plan_review')),
      findAllByProject: jest.fn(),
      update: jest.fn().mockResolvedValue(makeRun('designing')),
    };
    const reviewCheckpointRepo: jest.Mocked<IReviewCheckpointRepository> = {
      create: jest.fn(),
      findLatestPending: jest.fn().mockResolvedValue(checkpoint),
      findAllByRun: jest.fn(),
      update: jest.fn().mockResolvedValue({ ...checkpoint, status: 'approved' }),
    };
    const advance = jest.fn().mockResolvedValue(undefined);
    const runOrchestrator = { advance } as unknown as RunOrchestratorService;

    const usecase = new ApprovePlanReviewUsecase(runRepo, reviewCheckpointRepo, runOrchestrator);
    const result = await usecase.execute('run-1');

    expect(reviewCheckpointRepo.update).toHaveBeenCalledWith(
      'checkpoint-1',
      expect.objectContaining({ status: 'approved' }),
    );
    expect(runRepo.update).toHaveBeenCalledWith('run-1', { status: 'designing' });
    expect(advance).toHaveBeenCalledWith('run-1');
    expect(result.status).toBe('designing');
  });

  it('rejects when the run is not awaiting_plan_review', async () => {
    const runRepo: jest.Mocked<IRunRepository> = {
      create: jest.fn(),
      findById: jest.fn().mockResolvedValue(makeRun('designing')),
      findAllByProject: jest.fn(),
      update: jest.fn(),
    };
    const reviewCheckpointRepo: jest.Mocked<IReviewCheckpointRepository> = {
      create: jest.fn(),
      findLatestPending: jest.fn(),
      findAllByRun: jest.fn(),
      update: jest.fn(),
    };
    const runOrchestrator = { advance: jest.fn() } as unknown as RunOrchestratorService;

    const usecase = new ApprovePlanReviewUsecase(runRepo, reviewCheckpointRepo, runOrchestrator);

    await expect(usecase.execute('run-1')).rejects.toThrow();
    expect(runRepo.update).not.toHaveBeenCalled();
  });
});
