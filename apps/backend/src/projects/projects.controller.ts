import {
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
  Get,
  Param, 
  ParseIntPipe,
  Put,
  Delete
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateProjectDto } from './dto/update-project.dto';
@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Request() req,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectsService.create(
      req.user.id,
      dto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req) {
    return this.projectsService.findAll(
        req.user.id,
    );
    }


  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(
  @Param('id', ParseIntPipe) id: number,
  @Request() req,
    ) {
    return this.projectsService.findOne(
        id,
        req.user.id,
    );
    }


  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body() dto: UpdateProjectDto,
    ) {
    return this.projectsService.update(
        id,
        req.user.id,
        dto,
    );
    }
  @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    ) {
    return this.projectsService.remove(
        id,
        req.user.id,
    );
    }
}