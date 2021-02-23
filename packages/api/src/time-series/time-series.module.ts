import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityExists } from '../validations/entity-exists.constraint';
import { GoogleCloudModule } from '../google-cloud/google-cloud.module';
import { GoogleCloudService } from '../google-cloud/google-cloud.service';
import { ReefPointOfInterest } from '../reef-pois/reef-pois.entity';
import { Reef } from '../reefs/reefs.entity';
import { SurveyMedia } from '../surveys/survey-media.entity';
import { Survey } from '../surveys/surveys.entity';
import { User } from '../users/users.entity';
import { Metrics } from './metrics.entity';
import { TimeSeriesController } from './time-series.controller';
import { TimeSeries } from './time-series.entity';
import { TimeSeriesService } from './time-series.service';
import { Sources } from '../reefs/sources.entity';

@Module({
  controllers: [TimeSeriesController],
  providers: [TimeSeriesService, EntityExists, GoogleCloudService],
  imports: [
    TypeOrmModule.forFeature([
      Reef,
      ReefPointOfInterest,
      Metrics,
      TimeSeries,
      User,
      Survey,
      SurveyMedia,
      Sources,
    ]),
    GoogleCloudModule,
  ],
})
export class TimeSeriesModule {}
