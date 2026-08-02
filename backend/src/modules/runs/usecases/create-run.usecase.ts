import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IRunRepository } from '../ports/output/run-repository.port';
import { IProjectRepository } from '../../projects/ports/output/project-repository.port';
import { RunOrchestratorService } from '../infrastructure/orchestration/run-orchestrator.service';
import { PipelineRunEntity } from '../../shared/domain/entities/pipeline-run.entity';
import { CreateRunRequestDto } from '../presenter/dtos/create-run.dto';

@Injectable()
export class CreateRunUsecase {
  constructor(
    @Inject(IRunRepository) private readonly runRepo: IRunRepository,
    @Inject(IProjectRepository) private readonly projectRepo: IProjectRepository,
    private readonly runOrchestrator: RunOrchestratorService,
  ) {}

  // Deliberately not @Transactional(): a single insert needs no wrapping transaction, and
  // advance() below must run only after this row is actually committed and visible.
  async execute(dto: CreateRunRequestDto): Promise<PipelineRunEntity> {
    const project = await this.projectRepo.findById(dto.projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const run = await this.runRepo.create(
      new PipelineRunEntity({
        projectId: dto.projectId,
        title: dto.title,
        requestDescription: dto.requestDescription,
        isNewFeature: dto.isNewFeature,
      }),
    );

    // Fire-and-forget — the run advances in the background; the HTTP caller doesn't wait
    // for any of it (the pipeline page picks up progress over SSE).
    void this.runOrchestrator.advance(run.id!);

    return run;
  }
}
