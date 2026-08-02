import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Transactional } from '../../../libs/decorators/transactional.decorator';
import { IProjectRepository } from '../ports/output/project-repository.port';

@Injectable()
export class DeleteProjectUsecase {
  constructor(
    @Inject(IProjectRepository) private readonly projectRepo: IProjectRepository,
  ) {}

  @Transactional()
  async execute(id: string): Promise<void> {
    const existing = await this.projectRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('Project not found');
    }
    await this.projectRepo.delete(id);
  }
}
