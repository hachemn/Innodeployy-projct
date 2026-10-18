import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DeploymentStatus } from '@prisma/client';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { RepositoriesService } from '../repositories/repositories.service';
import { JenkinsService } from '../jenkins/jenkins.service';

const execFileAsync = promisify(execFile);

@Injectable()
export class DeploymentsService {
  constructor(
    private prisma: PrismaService,
    private projectsService: ProjectsService,
    private repositoriesService: RepositoriesService,
    private jenkinsService: JenkinsService,
  ) {}

  /**
   * Waits for Argo CD and Kubernetes to confirm that the expected
   * application image has been deployed successfully.
   */
  private async verifyDeployment(
    appName: string,
    expectedImage: string,
  ): Promise<void> {
    const timeout = 5 * 60 * 1000;
    const pollInterval = 5000;
    const deadline = Date.now() + timeout;

    while (Date.now() < deadline) {
      try {
        // Check Argo CD synchronization and application health.
        const { stdout: appOutput } = await execFileAsync(
          '/snap/bin/kubectl',
          [
            'get',
            'application',
            appName,
            '-n',
            'argocd',
            '-o',
            'jsonpath={.status.sync.status}{" "}{.status.health.status}',
          ],
          { timeout: 10000 },
        );

        const [syncStatus, healthStatus] = appOutput
          .trim()
          .split(/\s+/);

        // Check the deployed image and replica readiness.
        const { stdout: deploymentOutput } = await execFileAsync(
          '/snap/bin/kubectl',
          [
            'get',
            'deployment',
            appName,
            '-n',
            'user-apps',
            '-o',
            'jsonpath={.spec.template.spec.containers[0].image}{" "}{.spec.replicas}{" "}{.status.updatedReplicas}{" "}{.status.readyReplicas}{" "}{.status.availableReplicas}',
          ],
          { timeout: 10000 },
        );

        const [
          image,
          desiredText,
          updatedText,
          readyText,
          availableText,
        ] = deploymentOutput.trim().split(/\s+/);

        const desired = Number(desiredText);
        const updated = Number(updatedText);
        const ready = Number(readyText);
        const available = Number(availableText);

        const isHealthy =
          syncStatus === 'Synced' &&
          healthStatus === 'Healthy' &&
          image === expectedImage &&
          desired > 0 &&
          updated === desired &&
          ready === desired &&
          available === desired;

        if (isHealthy) {
          console.log(
            `Deployment ${appName} is healthy with image ${expectedImage}`,
          );

          return;
        }
      } catch (error) {
        // The application or Deployment may not exist yet.
        // Continue polling until the timeout expires.
        console.log(
          `Waiting for application ${appName} to become healthy...`,
        );
      }

      await new Promise((resolve) =>
        setTimeout(resolve, pollInterval),
      );
    }

    throw new Error(
      `Deployment ${appName} did not become healthy with image ${expectedImage} within 5 minutes.`,
    );
  }

  /**
   * Creates a deployment, triggers Jenkins, and verifies the
   * resulting deployment in Argo CD and Kubernetes.
   */
  async create(projectId: number, userId: number) {
    console.log('CREATE DEPLOYMENT STARTED');
    console.log('Project ID:', projectId);
    console.log('User ID:', userId);

    // Verify that the project belongs to the current user.
    await this.projectsService.findOne(projectId, userId);

    // Retrieve the repository associated with this project.
    const repository =
      await this.repositoriesService.findByProject(projectId);

    if (!repository) {
      throw new NotFoundException(
        'Repository not found for this project',
      );
    }

    // Create the deployment record.
    const deployment = await this.prisma.deployment.create({
      data: {
        projectId,
        status: DeploymentStatus.PENDING,
      },
    });

    await this.updateStatus(
      deployment.id,
      DeploymentStatus.RUNNING,
    );

    try {
      // Generate an application name consistent with the
      // Kubernetes resources created by Jenkins.
      const repositoryName =
        repository.url.split('/').pop()?.replace(/\.git$/, '') ||
        `app-${projectId}`;

      const appSlug =
        repositoryName
          .toLowerCase()
          .replace(/[^a-z0-9-]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 50) || 'app';

      const appName = `${appSlug}-${projectId}`;

      console.log('Application name:', appName);
      console.log('Repository:', repository.url);
      console.log('Branch:', repository.branch);

      // Trigger the user application pipeline in Jenkins.
      const result =
        await this.jenkinsService.startUserAppPipeline(
          deployment.id,
          repository.url,
          repository.branch,
          appName,
        );

      console.log('Jenkins build number:', result.buildNumber);
      console.log('Jenkins build result:', result.buildResult);

      // Save the Jenkins build number.
      await this.prisma.deployment.update({
        where: {
          id: deployment.id,
        },
        data: {
          jenkinsBuildNumber: result.buildNumber,
        },
      });

      // A failed Jenkins build must never be marked successful.
      if (result.buildResult !== 'SUCCESS') {
        const failureReason =
          result.message ||
          `Jenkins build failed with status: ${result.buildResult}`;

        await this.prisma.deployment.update({
          where: {
            id: deployment.id,
          },
          data: {
            status: DeploymentStatus.FAILED,
            failureReason,
          },
        });

        return await this.prisma.deployment.findUnique({
          where: {
            id: deployment.id,
          },
        });
      }

      // Jenkins succeeded. Now verify that Argo CD has applied
      // the exact image built by this Jenkins run.
      const expectedImage =
        `ghcr.io/hachemn/${appName}:${result.buildNumber}`;

      await this.verifyDeployment(
        appName,
        expectedImage,
      );

      // Mark SUCCESS only after Kubernetes confirms readiness.
      await this.prisma.deployment.update({
        where: {
          id: deployment.id,
        },
        data: {
          status: DeploymentStatus.SUCCESS,
          failureReason: null,
        },
      });
    } catch (error) {
      const failureReason =
        error instanceof Error
          ? error.message
          : 'An unexpected deployment error occurred';

      console.error(
        `Deployment ${deployment.id} failed:`,
        failureReason,
      );

      // Persist the failure so it remains visible in deployment
      // history, including when the health check times out.
      await this.prisma.deployment.update({
        where: {
          id: deployment.id,
        },
        data: {
          status: DeploymentStatus.FAILED,
          failureReason,
        },
      });

      throw error;
    }

    // Return the final database record.
    return await this.prisma.deployment.findUnique({
      where: {
        id: deployment.id,
      },
    });
  }

  /**
   * Returns deployment history for a project owned by the user.
   */
  async findAll(projectId: number, userId: number) {
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

  /**
   * Returns one deployment and its project/repository details.
   */
  async findOne(
    projectId: number,
    deploymentId: number,
    userId: number,
  ) {
    await this.projectsService.findOne(projectId, userId);

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

  /**
   * Updates a deployment's status.
   */
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