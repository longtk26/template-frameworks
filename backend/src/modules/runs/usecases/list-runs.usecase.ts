import { Inject, Injectable } from '@nestjs/common';
import { IRunRepository } from '../ports/output/run-repository.port';
import { PipelineRunEntity } from '../../shared/domain/entities/pipeline-run.entity';

@Injectable()
export class ListRunsUsecase {
  constructor(@Inject(IRunRepository) private readonly runRepo: IRunRepository) {}

  execute(projectId: string): Promise<PipelineRunEntity[]> {
    return this.runRepo.findAllByProject(projectId);
  }
}
