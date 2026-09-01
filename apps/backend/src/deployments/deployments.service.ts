import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { DeploymentStatus } from '@prisma/client';
import { RepositoriesService } from '../repositories/repositories.service';
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

  // Créer le deployment → PENDING
  const deployment = await this.prisma.deployment.create({
    data: {
      projectId,
    },
  });

  // PENDING → RUNNING
  await this.updateStatus(
    deployment.id,
    DeploymentStatus.RUNNING,
  );

  try {
    // Lancer Jenkins
    await this.jenkinsService.startPipeline(
      deployment.id,
      repository.url,
      repository.branch,
    );

    // RUNNING → SUCCESS
    await this.updateStatus(
      deployment.id,
      DeploymentStatus.SUCCESS,
    );
  } catch (error) {
    // RUNNING → FAILED
    await this.updateStatus(
      deployment.id,
      DeploymentStatus.FAILED,
    );

    throw error;
  }

  // Retourner le deployment avec son statut final
  return this.prisma.deployment.findUnique({
    where: {
      id: deployment.id,
    },
  });
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
