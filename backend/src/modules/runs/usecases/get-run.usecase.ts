import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IRunRepository } from '../ports/output/run-repository.port';
import { PipelineRunEntity } from '../../shared/domain/entities/pipeline-run.entity';

@Injectable()
export class GetRunUsecase {
  constructor(@Inject(IRunRepository) private readonly runRepo: IRunRepository) {}

  async execute(id: string): Promise<PipelineRunEntity> {
    const run = await this.runRepo.findById(id);
    if (!run) throw new NotFoundException('Run not found');
    return run;
  }
}
