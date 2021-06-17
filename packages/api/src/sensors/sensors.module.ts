import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyData } from '../reefs/daily-data.entity';
import { Reef } from '../reefs/reefs.entity';
import { Sources } from '../reefs/sources.entity';
import { Survey } from '../surveys/surveys.entity';
import { TimeSeries } from '../time-series/time-series.entity';
import { SensorsController } from './sensors.controller';
import { SensorsService } from './sensors.service';

@Module({
  controllers: [SensorsController],
  providers: [SensorsService],
  imports: [
    TypeOrmModule.forFeature([DailyData, Reef, Sources, Survey, TimeSeries]),
  ],
})
export class SensorsModule {}
