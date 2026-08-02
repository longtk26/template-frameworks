import { IsBoolean, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateRunRequestDto {
  @IsUUID()
  projectId: string;

  @IsString()
  @MaxLength(255)
  title: string;

  @IsString()
  requestDescription: string;

  @IsBoolean()
  @IsOptional()
  isNewFeature?: boolean;
}
