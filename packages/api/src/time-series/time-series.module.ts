import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataUploads } from '../data-uploads/data-uploads.entity';
import { Region } from '../regions/regions.entity';
import { SiteSurveyPoint } from '../site-survey-points/site-survey-points.entity';
import { HistoricalMonthlyMean } from '../sites/historical-monthly-mean.entity';
import { Site } from '../sites/sites.entity';
import { Sources } from '../sites/sources.entity';
import { SurveyMedia } from '../surveys/survey-media.entity';
import { Survey } from '../surveys/surveys.entity';
import { User } from '../users/users.entity';
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
      User,
      Survey,
      SurveyMedia,
      Region,
      HistoricalMonthlyMean,
    ]),
  ],
})
export class TimeSeriesModule {}
