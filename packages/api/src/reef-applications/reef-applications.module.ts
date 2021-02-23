import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReefApplicationsController } from './reef-applications.controller';
import { ReefApplicationsService } from './reef-applications.service';
import { EntityExists } from '../validations/entity-exists.constraint';
import { Reef } from '../reefs/reefs.entity';
import { ReefApplication } from './reef-applications.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Reef, ReefApplication])],
  controllers: [ReefApplicationsController],
  providers: [ReefApplicationsService, EntityExists],
})
export class ReefApplicationsModule {}
