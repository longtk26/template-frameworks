import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IProjectRepository } from '../ports/output/project-repository.port';
import { ProjectResponseDto } from '../presenter/dtos/project-response.dto';
import { toProjectResponseDto } from './to-project-response-dto';

@Injectable()
export class GetProjectUsecase {
  constructor(
    @Inject(IProjectRepository) private readonly projectRepo: IProjectRepository,
  ) {}

  async execute(id: string): Promise<ProjectResponseDto> {
    const project = await this.projectRepo.findById(id);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return toProjectResponseDto(project);
  }
}
