import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyData } from '../sites/daily-data.entity';
import { Site } from '../sites/sites.entity';
import { Sources } from '../sites/sources.entity';
import { Survey } from '../surveys/surveys.entity';
import { TimeSeries } from '../time-series/time-series.entity';
import { SensorsController } from './sensors.controller';
import { SensorsService } from './sensors.service';

@Module({
  controllers: [SensorsController],
  providers: [SensorsService],
  imports: [
    TypeOrmModule.forFeature([DailyData, Site, Sources, Survey, TimeSeries]),
  ],
})
export class SensorsModule {}
