import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityExists } from '../validations/entity-exists.constraint';
import { TimeSeriesController } from './time-series.controller';
import { TimeSeries } from './time-series.entity';
import { TimeSeriesService } from './time-series.service';

@Module({
  controllers: [TimeSeriesController],
  providers: [TimeSeriesService, EntityExists],
  imports: [TypeOrmModule.forFeature([TimeSeries])],
})
export class TimeSeriesModule {}
