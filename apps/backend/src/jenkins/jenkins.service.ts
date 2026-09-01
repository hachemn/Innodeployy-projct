import { Injectable, InternalServerErrorException } from '@nestjs/common';
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
      const response = await axios.get(
        `${this.jenkinsUrl}/api/json`,
        {
          auth: {
            username: this.jenkinsUser!,
            password: this.jenkinsToken!,
          },
        },
      );

      console.log('Jenkins connected successfully');
      console.log('Jenkins status:', response.status);

      return response.data;
    } catch (error) {
      console.error('Jenkins connection failed:', error);

      throw new InternalServerErrorException(
        'Unable to connect to Jenkins',
      );
    }
  }
}