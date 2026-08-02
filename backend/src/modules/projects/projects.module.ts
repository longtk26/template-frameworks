import { Module } from '@nestjs/common';
import { ProjectController } from './presenter/project.controller';
import { CreateProjectUsecase } from './usecases/create-project.usecase';
import { ListProjectsUsecase } from './usecases/list-projects.usecase';
import { GetProjectUsecase } from './usecases/get-project.usecase';
import { UpdateProjectUsecase } from './usecases/update-project.usecase';
import { DeleteProjectUsecase } from './usecases/delete-project.usecase';
import { IProjectRepository } from './ports/output/project-repository.port';
import { ProjectRepository } from './infrastructure/persistence/project.repository';

@Module({
  controllers: [ProjectController],
  providers: [
    { provide: IProjectRepository, useClass: ProjectRepository },
    CreateProjectUsecase,
    ListProjectsUsecase,
    GetProjectUsecase,
    UpdateProjectUsecase,
    DeleteProjectUsecase,
  ],
  exports: [IProjectRepository],
})
export class ProjectsModule {}
