import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Site } from 'sites/sites.entity';
import { Survey } from 'surveys/surveys.entity';
import { LatestData } from 'time-series/latest-data.entity';
import { User } from 'users/users.entity';
import { MonitoringController } from './monitoring.controller';
import { Monitoring } from './monitoring.entity';
import { MonitoringService } from './monitoring.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Monitoring, User, Site, Survey, LatestData]),
  ],
  controllers: [MonitoringController],
  providers: [MonitoringService],
})
export class MonitoringModule {}
