import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { CreateRepositoryDto } from './dto/create-repository.dto';
@Injectable()
export class RepositoriesService {
  constructor(
    private prisma: PrismaService,
    private projectsService: ProjectsService,
  ) {}

  async create(
  projectId: number,
  userId: number,
  dto: CreateRepositoryDto,
) {
  await this.projectsService.findOne(projectId, userId);

  return this.prisma.repository.create({
    data: {
      provider: dto.provider,
      url: dto.url,
      branch: dto.branch ?? 'main',
      projectId,
    },
  });
}

async findByProject(projectId: number) {
  return this.prisma.repository.findUnique({
    where: {
      projectId,
    },
  });
}
}