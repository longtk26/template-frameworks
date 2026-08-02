import { ProjectEntity } from '../../../shared/domain/entities/project.entity';

export abstract class IProjectRepository {
  abstract create(project: ProjectEntity): Promise<ProjectEntity>;
  abstract findById(id: string): Promise<ProjectEntity | null>;
  abstract findAll(): Promise<ProjectEntity[]>;
  abstract update(
    id: string,
    changes: Partial<
      Pick<
        ProjectEntity,
        | 'name'
        | 'description'
        | 'defaultBranch'
        | 'mirrorPath'
        | 'backendFramework'
        | 'frontendFramework'
      >
    >,
  ): Promise<ProjectEntity>;
  abstract delete(id: string): Promise<void>;
}
