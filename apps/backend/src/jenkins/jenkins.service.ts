
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

  // Wait until Jenkins creates the build from the queue item
  private async waitForBuild(queueUrl: string) {
    while (true) {
      const response = await axios.get(
        `${queueUrl}api/json`,
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

      await new Promise((resolve) =>
        setTimeout(resolve, 2000),
      );
    }
  }

  // Wait until the Jenkins build finishes
  private async waitForBuildResult(buildNumber: number) {
    while (true) {
      const response = await axios.get(
        `${this.jenkinsUrl}/job/InnoDeploy-Backend/${buildNumber}/api/json`,
        {
          auth: {
            username: this.jenkinsUser!,
            password: this.jenkinsToken!,
          },
        },
      );

      const data = response.data;

      console.log(
        'Jenkins build status:',
        data.building ? 'RUNNING' : data.result,
      );

      if (!data.building) {
        return data.result;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, 2000),
      );
    }
  }

  async startPipeline(
    deploymentId: number,
    repositoryUrl: string,
    branch: string,
  ) {
    console.log('======================');
    console.log('Starting Jenkins Pipeline');
    console.log('Deployment:', deploymentId);
    console.log('Repository:', repositoryUrl);
    console.log('Branch:', branch);
    console.log('======================');

    try {
      // 1. Get Jenkins CSRF crumb
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

      // 2. Trigger Jenkins job
      const response = await axios.post(
        `${this.jenkinsUrl}/job/InnoDeploy-Backend/build`,
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

      console.log('Jenkins pipeline triggered');
      console.log('Jenkins status:', response.status);
      console.log('Jenkins headers:', response.headers);

      // 3. Get Jenkins queue URL
      const queueUrl = response.headers.location;

      if (!queueUrl) {
        throw new Error('Jenkins queue URL not found');
      }

      console.log('Jenkins queue URL:', queueUrl);

      // 4. Wait until Jenkins creates the build
      const buildNumber = await this.waitForBuild(queueUrl);

      console.log('Jenkins build number:', buildNumber);

      // 5. Wait until the Jenkins build finishes
      const buildResult =
        await this.waitForBuildResult(buildNumber);

      console.log('Jenkins build result:', buildResult);

      return {
        success: buildResult === 'SUCCESS',
        message: `Jenkins pipeline finished with result: ${buildResult}`,
        buildNumber,
        buildResult,
      };
    } catch (error) {
      console.error('Jenkins pipeline failed:', error);

      throw new InternalServerErrorException(
        'Unable to trigger Jenkins pipeline',
      );
    }
  }
}
