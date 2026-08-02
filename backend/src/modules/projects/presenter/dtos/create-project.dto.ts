import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { ProjectEntity } from '../../../shared/domain/entities/project.entity';

export class CreateProjectRequestDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  repoUrl: string;

  @IsString()
  @IsOptional()
  defaultBranch?: string;

  @IsString()
  @IsOptional()
  backendFramework?: string;

  @IsString()
  @IsOptional()
  frontendFramework?: string;

  @IsBoolean()
  @IsOptional()
  bootstrapFromTemplate?: boolean;

  toEntity(): ProjectEntity {
    return new ProjectEntity({
      name: this.name,
      description: this.description,
      repoUrl: this.repoUrl,
      defaultBranch: this.defaultBranch,
      backendFramework: this.backendFramework,
      frontendFramework: this.frontendFramework,
      bootstrapFromTemplate: this.bootstrapFromTemplate,
    });
  }
}
