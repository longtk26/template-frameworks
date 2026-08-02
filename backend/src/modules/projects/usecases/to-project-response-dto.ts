import { ProjectEntity } from '../../shared/domain/entities/project.entity';
import { ProjectResponseDto } from '../presenter/dtos/project-response.dto';

export function toProjectResponseDto(project: ProjectEntity): ProjectResponseDto {
  return {
    id: project.id!,
    name: project.name,
    description: project.description,
    repoUrl: project.repoUrl,
    defaultBranch: project.defaultBranch,
    backendFramework: project.backendFramework,
    frontendFramework: project.frontendFramework,
    bootstrapFromTemplate: project.bootstrapFromTemplate,
    createdAt: project.createdAt!,
    updatedAt: project.updatedAt!,
  };
}
