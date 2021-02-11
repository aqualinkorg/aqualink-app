import { Module } from '@nestjs/common';
import { TimeSeriesController } from './time-series.controller';
import { TimeSeriesService } from './time-series.service';

@Module({
  controllers: [TimeSeriesController],
  providers: [TimeSeriesService],
})
export class TimeSeriesModule {}
