import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateProjectUsecase } from '../usecases/create-project.usecase';
import { ListProjectsUsecase } from '../usecases/list-projects.usecase';
import { GetProjectUsecase } from '../usecases/get-project.usecase';
import { UpdateProjectUsecase } from '../usecases/update-project.usecase';
import { DeleteProjectUsecase } from '../usecases/delete-project.usecase';
import { CreateProjectRequestDto } from './dtos/create-project.dto';
import { UpdateProjectRequestDto } from './dtos/update-project.dto';
import { ProjectResponseDto } from './dtos/project-response.dto';

@ApiTags('projects')
@Controller('projects')
export class ProjectController {
  constructor(
    private readonly createProjectUsecase: CreateProjectUsecase,
    private readonly listProjectsUsecase: ListProjectsUsecase,
    private readonly getProjectUsecase: GetProjectUsecase,
    private readonly updateProjectUsecase: UpdateProjectUsecase,
    private readonly deleteProjectUsecase: DeleteProjectUsecase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateProjectRequestDto): Promise<ProjectResponseDto> {
    return this.createProjectUsecase.execute(dto);
  }

  @Get()
  list(): Promise<ProjectResponseDto[]> {
    return this.listProjectsUsecase.execute();
  }

  @Get(':id')
  get(@Param('id') id: string): Promise<ProjectResponseDto> {
    return this.getProjectUsecase.execute(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectRequestDto,
  ): Promise<ProjectResponseDto> {
    return this.updateProjectUsecase.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string): Promise<void> {
    return this.deleteProjectUsecase.execute(id);
  }
}
