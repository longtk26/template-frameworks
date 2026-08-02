import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IRunRepository } from '../ports/output/run-repository.port';
import { IProjectRepository } from '../../projects/ports/output/project-repository.port';
import { IGitService } from '../../git/ports/output/git-service.port';

@Injectable()
export class GetRunDiffUsecase {
  constructor(
    @Inject(IRunRepository) private readonly runRepo: IRunRepository,
    @Inject(IProjectRepository) private readonly projectRepo: IProjectRepository,
    @Inject(IGitService) private readonly gitService: IGitService,
  ) {}

  async execute(runId: string): Promise<{ diff: string }> {
    const run = await this.runRepo.findById(runId);
    if (!run) throw new NotFoundException('Run not found');
    if (!run.worktreePath) {
      throw new BadRequestException('Run has not started yet — no worktree to diff');
    }

    const project = await this.projectRepo.findById(run.projectId);
    if (!project) throw new NotFoundException('Project not found');

    const diff = await this.gitService.getDiff(
      run.worktreePath,
      `origin/${project.defaultBranch}`,
    );
    return { diff };
  }
}
