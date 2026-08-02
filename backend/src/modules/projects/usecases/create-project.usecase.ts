import { Inject, Injectable } from '@nestjs/common';
import { Transactional } from '../../../libs/decorators/transactional.decorator';
import { IProjectRepository } from '../ports/output/project-repository.port';
import { CreateProjectRequestDto } from '../presenter/dtos/create-project.dto';
import { ProjectResponseDto } from '../presenter/dtos/project-response.dto';
import { toProjectResponseDto } from './to-project-response-dto';

@Injectable()
export class CreateProjectUsecase {
  constructor(
    @Inject(IProjectRepository) private readonly projectRepo: IProjectRepository,
  ) {}

  @Transactional()
  async execute(dto: CreateProjectRequestDto): Promise<ProjectResponseDto> {
    const project = await this.projectRepo.create(dto.toEntity());
    return toProjectResponseDto(project);
  }
}
