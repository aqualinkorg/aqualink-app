import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityExists } from '../validations/entity-exists.constraint';
import { ReefPointOfInterest } from '../reef-pois/reef-pois.entity';
import { Reef } from '../reefs/reefs.entity';
import { Metrics } from './metrics.entity';
import { TimeSeriesController } from './time-series.controller';
import { TimeSeries } from './time-series.entity';
import { TimeSeriesService } from './time-series.service';

@Module({
  controllers: [TimeSeriesController],
  providers: [TimeSeriesService, EntityExists],
  imports: [
    TypeOrmModule.forFeature([Reef, ReefPointOfInterest, Metrics, TimeSeries]),
  ],
})
export class TimeSeriesModule {}
