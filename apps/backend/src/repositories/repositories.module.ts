import { Module } from '@nestjs/common';
import { RepositoriesController } from './repositories.controller';
import { RepositoriesService } from './repositories.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ProjectsModule } from '../projects/projects.module';
@Module({
  imports: [PrismaModule,ProjectsModule ],
  controllers: [RepositoriesController],
  providers: [RepositoriesService],
})
export class RepositoriesModule {}