import { Inject, Injectable } from '@nestjs/common';
import { IProjectRepository } from '../ports/output/project-repository.port';
import { ProjectResponseDto } from '../presenter/dtos/project-response.dto';
import { toProjectResponseDto } from './to-project-response-dto';

@Injectable()
export class ListProjectsUsecase {
  constructor(
    @Inject(IProjectRepository) private readonly projectRepo: IProjectRepository,
  ) {}

  async execute(): Promise<ProjectResponseDto[]> {
    const projects = await this.projectRepo.findAll();
    return projects.map(toProjectResponseDto);
  }
}
