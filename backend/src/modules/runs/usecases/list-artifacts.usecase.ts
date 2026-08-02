import { Inject, Injectable } from '@nestjs/common';
import { IArtifactRepository } from '../ports/output/artifact-repository.port';
import { ArtifactEntity } from '../../shared/domain/entities/artifact.entity';

@Injectable()
export class ListArtifactsUsecase {
  constructor(
    @Inject(IArtifactRepository) private readonly artifactRepo: IArtifactRepository,
  ) {}

  execute(runId: string): Promise<ArtifactEntity[]> {
    return this.artifactRepo.findAllByRun(runId);
  }
}
