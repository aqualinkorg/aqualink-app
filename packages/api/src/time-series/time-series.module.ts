import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Monitoring } from 'monitoring/monitoring.entity';
import { DataUploadsSites } from '../data-uploads/data-uploads-sites.entity';
import { DataUploads } from '../data-uploads/data-uploads.entity';
import { SiteSurveyPoint } from '../site-survey-points/site-survey-points.entity';
import { Site } from '../sites/sites.entity';
import { Sources } from '../sites/sources.entity';
import { EntityExists } from '../validations/entity-exists.constraint';
import { TimeSeriesController } from './time-series.controller';
import { TimeSeries } from './time-series.entity';
import { TimeSeriesService } from './time-series.service';

@Module({
  controllers: [TimeSeriesController],
  providers: [TimeSeriesService, EntityExists],
  imports: [
    TypeOrmModule.forFeature([
      TimeSeries,
      Site,
      SiteSurveyPoint,
      Sources,
      DataUploads,
      DataUploadsSites,
      Monitoring,
    ]),
  ],
})
export class TimeSeriesModule {}
