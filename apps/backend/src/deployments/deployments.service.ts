import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { DeploymentStatus } from '@prisma/client';
import { RepositoriesService } from '../repositories/repositories.service';
import { JenkinsService } from '../jenkins/jenkins.service';

@Injectable()
export class DeploymentsService {
  constructor(
    private prisma: PrismaService,
    private projectsService: ProjectsService,
    private repositoriesService: RepositoriesService,
    private jenkinsService: JenkinsService,
  ) {}

  async create(projectId: number, userId: number) {
    console.log('🚀 CREATE DEPLOYMENT STARTED');
    console.log('Project ID:', projectId);
    console.log('User ID:', userId);

    // 1. Verify project ownership
    await this.projectsService.findOne(projectId, userId);

    console.log('✅ Project ownership verified');

    // 2. Get repository
    const repository =
      await this.repositoriesService.findByProject(projectId);

    if (!repository) {
      throw new NotFoundException(
        'Repository not found for this project',
      );
    }

    console.log('✅ Repository found:', repository.url);
    console.log('Branch:', repository.branch);

    // 3. Create deployment
    const deployment = await this.prisma.deployment.create({
      data: {
        projectId,
      },
    });

    console.log('✅ Deployment created:', deployment.id);

    // 4. PENDING → RUNNING
    await this.updateStatus(
      deployment.id,
      DeploymentStatus.RUNNING,
    );

    console.log(
      '✅ Deployment status changed to RUNNING',
    );

    try {
      // 5. Start Jenkins and wait for result
      const result = await this.jenkinsService.startPipeline(
        deployment.id,
        repository.url,
        repository.branch,
      );

      console.log('✅ Jenkins pipeline finished');
      console.log('Jenkins result:', result);

      // 6. Save Jenkins build number
      console.log(
        '💾 Saving Jenkins build number:',
        result.buildNumber,
      );

      const updatedDeployment =
        await this.prisma.deployment.update({
          where: {
            id: deployment.id,
          },
          data: {
            jenkinsBuildNumber: result.buildNumber,
          },
        });

      console.log(
        '✅ Jenkins build number saved:',
        updatedDeployment.jenkinsBuildNumber,
      );

      // 7. Update deployment status
      if (result.buildResult === 'SUCCESS') {
        console.log(
          '✅ Jenkins SUCCESS → setting deployment SUCCESS',
        );

        await this.prisma.deployment.update({
          where: {
            id: deployment.id,
          },
          data: {
            status: DeploymentStatus.SUCCESS,
            failureReason: null,
          },
        });

        console.log(
          '✅ Deployment status changed to SUCCESS',
        );
      } else {
        console.log(
          '❌ Jenkins result is not SUCCESS:',
          result.buildResult,
        );

        const failureReason =
          result.buildResult
            ? `Jenkins build finished with status: ${result.buildResult}`
            : 'Jenkins build failed without a result.';

        await this.prisma.deployment.update({
          where: {
            id: deployment.id,
          },
          data: {
            status: DeploymentStatus.FAILED,
            failureReason,
          },
        });

        console.log(
          '❌ Deployment status changed to FAILED',
        );

        console.log(
          '❌ Failure reason:',
          failureReason,
        );
      }
    } catch (error) {
      console.error(
        '🔥 ERROR INSIDE DEPLOYMENT CREATE:',
        error,
      );

      const failureReason =
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred during deployment.';

      await this.prisma.deployment.update({
        where: {
          id: deployment.id,
        },
        data: {
          status: DeploymentStatus.FAILED,
          failureReason,
        },
      });

      console.log(
        '❌ Deployment status changed to FAILED',
      );

      console.log(
        '❌ Failure reason:',
        failureReason,
      );

      throw error;
    }

    // 8. Get final deployment
    console.log(
      '📦 Fetching final deployment:',
      deployment.id,
    );

    const finalDeployment =
      await this.prisma.deployment.findUnique({
        where: {
          id: deployment.id,
        },
      });

    console.log(
      '✅ FINAL DEPLOYMENT:',
      finalDeployment,
    );

    return finalDeployment;
  }

  async findAll(
    projectId: number,
    userId: number,
  ) {
    await this.projectsService.findOne(
      projectId,
      userId,
    );

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
    await this.projectsService.findOne(
      projectId,
      userId,
    );

    return this.prisma.deployment.findFirst({
      where: {
        id: deploymentId,
        projectId,
      },
      include: {
        project: {
          include: {
            repository: true,
          },
        },
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