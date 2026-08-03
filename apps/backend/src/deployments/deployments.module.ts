import { Module } from '@nestjs/common';
import { DeploymentsController } from './deployments.controller';
import { DeploymentsService } from './deployments.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ProjectsModule } from '../projects/projects.module';
import { RepositoriesModule } from 'src/repositories/repositories.module';
import { JenkinsModule } from 'src/jenkins/jenkins.module';
@Module({
  imports: [
    PrismaModule,
    ProjectsModule,
    RepositoriesModule,
    JenkinsModule,
  ],
  controllers: [DeploymentsController],
  providers: [DeploymentsService]
})
export class DeploymentsModule {}
