import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProjectRequestDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  defaultBranch?: string;

  @IsString()
  @IsOptional()
  backendFramework?: string;

  @IsString()
  @IsOptional()
  frontendFramework?: string;
}
