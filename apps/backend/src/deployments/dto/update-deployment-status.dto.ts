import { IsEnum } from 'class-validator';
import { DeploymentStatus } from '@prisma/client';

export class UpdateDeploymentStatusDto {
  @IsEnum(DeploymentStatus)
  status: DeploymentStatus;
}