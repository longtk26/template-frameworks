import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class McpServerConfigDto {
  @IsString()
  name: string;

  @IsBoolean()
  enabled: boolean;

  config: Record<string, unknown> | null;
}

export class UpdateRoleConfigRequestDto {
  @IsString()
  @IsOptional()
  model?: string;

  @IsString()
  @IsOptional()
  systemPromptTemplate?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allowedTools?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => McpServerConfigDto)
  @IsOptional()
  mcpServers?: McpServerConfigDto[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skills?: string[];

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}
