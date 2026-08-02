import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Transactional } from '../../../libs/decorators/transactional.decorator';
import { IProjectRepository } from '../ports/output/project-repository.port';
import { UpdateProjectRequestDto } from '../presenter/dtos/update-project.dto';
import { ProjectResponseDto } from '../presenter/dtos/project-response.dto';
import { toProjectResponseDto } from './to-project-response-dto';

@Injectable()
export class UpdateProjectUsecase {
  constructor(
    @Inject(IProjectRepository) private readonly projectRepo: IProjectRepository,
  ) {}

  @Transactional()
  async execute(id: string, dto: UpdateProjectRequestDto): Promise<ProjectResponseDto> {
    const existing = await this.projectRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('Project not found');
    }
    const updated = await this.projectRepo.update(id, dto);
    return toProjectResponseDto(updated);
  }
}
