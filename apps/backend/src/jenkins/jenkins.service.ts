import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class JenkinsService {
  private readonly jenkinsUrl = process.env.JENKINS_URL;
  private readonly jenkinsUser = process.env.JENKINS_USER;
  private readonly jenkinsToken = process.env.JENKINS_TOKEN;

  // Wait until Jenkins creates the build from the queue item.
  private async waitForBuild(queueUrl: string): Promise<number> {
    while (true) {
      const response = await axios.get(
        `${queueUrl.replace(/\/?$/, '/')}api/json`,
        {
          auth: {
            username: this.jenkinsUser!,
            password: this.jenkinsToken!,
          },
        },
      );

      const data = response.data;

      if (data.cancelled) {
        throw new Error('Jenkins queue item was cancelled');
      }

      if (data.executable) {
        return data.executable.number;
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  // Wait until a build of the specified Jenkins job finishes.
  private async waitForBuildResult(
    jobName: string,
    buildNumber: number,
  ): Promise<string | null> {
    while (true) {
      const response = await axios.get(
        `${this.jenkinsUrl}/job/${encodeURIComponent(jobName)}/${buildNumber}/api/json`,
        {
          auth: {
            username: this.jenkinsUser!,
            password: this.jenkinsToken!,
          },
        },
      );

      const data = response.data;

      console.log(
        `Jenkins job ${jobName} status:`,
        data.building ? 'RUNNING' : data.result,
      );

      if (!data.building) {
        return data.result;
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  // Existing pipeline: builds and deploys the InnoDeployy backend.
  async startPipeline(
    deploymentId: number,
    repositoryUrl: string,
    branch: string,
  ) {
    const jobName = 'InnoDeploy-Backend';

    console.log('======================');
    console.log('Starting Jenkins Backend Pipeline');
    console.log('Deployment:', deploymentId);
    console.log('Repository:', repositoryUrl);
    console.log('Branch:', branch);
    console.log('======================');

    try {
      // 1. Get Jenkins CSRF crumb.
      const crumbResponse = await axios.get(
        `${this.jenkinsUrl}/crumbIssuer/api/json`,
        {
          auth: {
            username: this.jenkinsUser!,
            password: this.jenkinsToken!,
          },
        },
      );

      const crumb = crumbResponse.data;

      console.log('Jenkins crumb received');

      // 2. Trigger the existing backend job.
      const response = await axios.post(
        `${this.jenkinsUrl}/job/${jobName}/build`,
        null,
        {
          auth: {
            username: this.jenkinsUser!,
            password: this.jenkinsToken!,
          },
          headers: {
            [crumb.crumbRequestField]: crumb.crumb,
          },
        },
      );

      console.log('Backend pipeline triggered');
      console.log('Jenkins status:', response.status);

      // 3. Get the Jenkins queue URL.
      const queueUrl = response.headers.location;

      if (!queueUrl) {
        throw new Error('Jenkins queue URL not found');
      }

      console.log('Jenkins queue URL:', queueUrl);

      // 4. Wait until Jenkins creates the build.
      const buildNumber = await this.waitForBuild(queueUrl);

      console.log('Jenkins build number:', buildNumber);

      // 5. Wait for the backend build to finish.
      const buildResult = await this.waitForBuildResult(
        jobName,
        buildNumber,
      );

      console.log('Jenkins build result:', buildResult);

      return {
        success: buildResult === 'SUCCESS',
        message: `Jenkins pipeline finished with result: ${buildResult}`,
        buildNumber,
        buildResult,
      };
    } catch (error) {
      console.error('Backend Jenkins pipeline failed:', error);

      throw new InternalServerErrorException(
        'Unable to trigger Jenkins pipeline',
      );
    }
  }

  // New pipeline: builds and pushes a user's application image to GHCR.
  async startUserAppPipeline(
    deploymentId: number,
    repositoryUrl: string,
    branch: string,
    appName: string,
  ) {
    const jobName = 'InnoDeploy-UserApps';

    console.log('======================');
    console.log('Starting User Application Pipeline');
    console.log('Deployment:', deploymentId);
    console.log('Repository:', repositoryUrl);
    console.log('Branch:', branch);
    console.log('Application:', appName);
    console.log('======================');

    try {
      // 1. Get Jenkins CSRF crumb.
      const crumbResponse = await axios.get(
        `${this.jenkinsUrl}/crumbIssuer/api/json`,
        {
          auth: {
            username: this.jenkinsUser!,
            password: this.jenkinsToken!,
          },
        },
      );

      const crumb = crumbResponse.data;

      // 2. Trigger the user application job with its parameters.
      const response = await axios.post(
        `${this.jenkinsUrl}/job/${jobName}/buildWithParameters`,
        null,
        {
          auth: {
            username: this.jenkinsUser!,
            password: this.jenkinsToken!,
          },
          params: {
            REPOSITORY_URL: repositoryUrl,
            BRANCH: branch,
            APP_NAME: appName,
          },
          headers: {
            [crumb.crumbRequestField]: crumb.crumb,
          },
        },
      );

      console.log('User application pipeline triggered');
      console.log('Jenkins status:', response.status);

      // 3. Get the Jenkins queue URL.
      const queueUrl = response.headers.location;

      if (!queueUrl) {
        throw new Error('Jenkins queue URL not found');
      }

      console.log('Jenkins queue URL:', queueUrl);

      // 4. Wait until Jenkins creates the build.
      const buildNumber = await this.waitForBuild(queueUrl);

      console.log('User application build number:', buildNumber);

      // 5. Wait for the user application build to finish.
      const buildResult = await this.waitForBuildResult(
        jobName,
        buildNumber,
      );

      console.log(
        'User application build result:',
        buildResult,
      );

      return {
        success: buildResult === 'SUCCESS',
        message: `User application pipeline finished with result: ${buildResult}`,
        buildNumber,
        buildResult,
      };
    } catch (error) {
      console.error('User application Jenkins pipeline failed:', error);

      throw new InternalServerErrorException(
        'Unable to trigger user application pipeline',
      );
    }
  }
}