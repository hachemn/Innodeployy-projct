import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from './jwt/jwt.module';
import { ProjectsModule } from './projects/projects.module';
import { RepositoriesModule } from './repositories/repositories.module';
import { DeploymentsModule } from './deployments/deployments.module';
import { JenkinsModule } from './jenkins/jenkins.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, JwtModule, ProjectsModule, RepositoriesModule, DeploymentsModule, JenkinsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
