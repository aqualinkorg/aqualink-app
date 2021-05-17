import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityExists } from '../validations/entity-exists.constraint';
import { GoogleCloudService } from '../google-cloud/google-cloud.service';
import { TimeSeriesController } from './time-series.controller';
import { TimeSeries } from './time-series.entity';
import { TimeSeriesService } from './time-series.service';

@Module({
  controllers: [TimeSeriesController],
  providers: [TimeSeriesService, EntityExists, GoogleCloudService],
  imports: [TypeOrmModule.forFeature([TimeSeries])],
})
export class TimeSeriesModule {}
