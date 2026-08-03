import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { DeploymentStatus } from '@prisma/client';
import { RepositoriesService } from 'src/repositories/repositories.service';
import { JenkinsService } from 'src/jenkins/jenkins.service';
@Injectable()
export class DeploymentsService {
  constructor(
    private prisma: PrismaService,
    private projectsService: ProjectsService,
    private repositoriesService: RepositoriesService,
    private jenkinsService: JenkinsService,
  ) {}

async create(projectId: number, userId: number) {
  // Vérifier que le projet appartient à l'utilisateur
  await this.projectsService.findOne(projectId, userId);

  // Récupérer le repository du projet
  const repository =
    await this.repositoriesService.findByProject(projectId);

  if (!repository) {
    throw new NotFoundException(
      'Repository not found for this project',
    );
  }

  // Créer le deployment
  const deployment = await this.prisma.deployment.create({
    data: {
      projectId,
    },
  });

  // Plus tard :
  // await this.jenkinsService.startPipeline(...)

  //console.log('Repository found:', repository.url);
  //console.log('Branch:', repository.branch);
  //console.log('Deployment:', deployment.id);
  await this.jenkinsService.startPipeline(
    deployment.id,
    repository.url,
    repository.branch,
  );
  return deployment;
}


  async findAll(
  projectId: number,
  userId: number,
) {
  // Vérifie que le projet appartient à l'utilisateur
  await this.projectsService.findOne(projectId, userId);

  return this.prisma.deployment.findMany({
    where: {
      projectId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}



async findOne(
  projectId: number,
  deploymentId: number,
  userId: number,
) {
  // Vérifie que le projet appartient à l'utilisateur
  await this.projectsService.findOne(projectId, userId);

  return this.prisma.deployment.findFirst({
    where: {
      id: deploymentId,
      projectId,
    },
  });
}

async updateStatus(
  deploymentId: number,
  status: DeploymentStatus,
) {
  return this.prisma.deployment.update({
    where: {
      id: deploymentId,
    },
    data: {
      status,
    },
  });
}
}