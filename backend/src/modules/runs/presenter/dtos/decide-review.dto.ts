import { IsOptional, IsString } from 'class-validator';

export class DecideReviewRequestDto {
  @IsString()
  @IsOptional()
  note?: string;
}
