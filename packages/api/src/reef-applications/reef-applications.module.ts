import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReefApplicationsController } from './reef-applications.controller';
import { ReefApplicationsService } from './reef-applications.service';
import { ReefApplicationsRepository } from './reef-applications.repository';
import { EntityExists } from '../validations/entity-exists.constraint';

@Module({
  imports: [TypeOrmModule.forFeature([ReefApplicationsRepository])],
  controllers: [ReefApplicationsController],
  providers: [ReefApplicationsService, EntityExists],
})
export class ReefApplicationsModule {}
