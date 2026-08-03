import {
  Controller,
  Post,
  Param,
  ParseIntPipe,
  Request,
  UseGuards,
  Get,
  Body,
} from '@nestjs/common';

import { DeploymentsService } from './deployments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Patch } from '@nestjs/common';
import { UpdateDeploymentStatusDto } from './dto/update-deployment-status.dto';
@Controller('projects/:projectId/deployments')
export class DeploymentsController {
  constructor(
    private readonly deploymentsService: DeploymentsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Request() req,
  ) {
    return this.deploymentsService.create(
      projectId,
      req.user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
   @Param('projectId', ParseIntPipe) projectId: number,
   @Request() req,
    ) {
    return this.deploymentsService.findAll(
        projectId,
        req.user.id,
    );
    }

 @UseGuards(JwtAuthGuard)
 @Get(':id')
 findOne(
  @Param('projectId', ParseIntPipe) projectId: number,
  @Param('id', ParseIntPipe) deploymentId: number,
  @Request() req,
) {
  return this.deploymentsService.findOne(
    projectId,
    deploymentId,
    req.user.id,
  );
}

@UseGuards(JwtAuthGuard)
@Patch(':id/status')
updateStatus(
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: UpdateDeploymentStatusDto,
) {
  return this.deploymentsService.updateStatus(
    id,
    dto.status,
  );
}
}