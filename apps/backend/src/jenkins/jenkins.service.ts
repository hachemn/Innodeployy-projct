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

      return {
        success: true,
        message: 'Jenkins pipeline triggered successfully',
      };
    } catch (error) {
      console.error('Jenkins pipeline failed:', error);

      throw new InternalServerErrorException(
        'Unable to trigger Jenkins pipeline',
      );
    }
  }
}