import { IsIn, IsOptional } from 'class-validator';

export class CreateDeploymentDto {
  @IsOptional()
  @IsIn(['local', 'aws'])
  deployTarget?: 'local' | 'aws' = 'local';
}
