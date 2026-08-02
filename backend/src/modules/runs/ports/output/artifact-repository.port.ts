import { ArtifactEntity } from '../../../shared/domain/entities/artifact.entity';
import { ArtifactType } from '../../../shared/domain/types';

export abstract class IArtifactRepository {
  abstract create(artifact: ArtifactEntity): Promise<ArtifactEntity>;
  abstract findAllByRun(runId: string): Promise<ArtifactEntity[]>;
  abstract findLatestByRunAndType(
    runId: string,
    type: ArtifactType,
  ): Promise<ArtifactEntity | null>;
}
