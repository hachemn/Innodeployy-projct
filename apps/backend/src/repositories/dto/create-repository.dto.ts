import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { GitProvider } from '@prisma/client';

export class CreateRepositoryDto {
  @IsEnum(GitProvider)
  provider: GitProvider;

  @IsUrl()
  url: string;

  @IsOptional()
  @IsString()
  branch?: string;
}