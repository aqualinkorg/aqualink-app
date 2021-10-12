import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteApplicationsController } from './site-applications.controller';
import { SiteApplicationsService } from './site-applications.service';
import { EntityExists } from '../validations/entity-exists.constraint';
import { SiteApplication } from './site-applications.entity';
import { AuthModule } from '../auth/auth.module';
import { Site } from '../sites/sites.entity';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Site, SiteApplication])],
  controllers: [SiteApplicationsController],
  providers: [SiteApplicationsService, EntityExists],
})
export class SiteApplicationsModule {}
