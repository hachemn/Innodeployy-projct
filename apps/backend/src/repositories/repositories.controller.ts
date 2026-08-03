import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { RepositoriesService } from './repositories.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateRepositoryDto } from './dto/create-repository.dto';

@Controller('projects/:projectId/repository')
export class RepositoriesController {
  constructor(
    private readonly repositoriesService: RepositoriesService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Request() req,
    @Body() dto: CreateRepositoryDto,
  ) {
    return this.repositoriesService.create(
      projectId,
      req.user.id,
      dto,
    );
  }
}