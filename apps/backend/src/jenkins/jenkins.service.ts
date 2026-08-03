import { Injectable } from '@nestjs/common';

@Injectable()
export class JenkinsService {

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
  }

}