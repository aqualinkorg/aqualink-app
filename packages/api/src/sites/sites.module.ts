import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SitesController } from './sites.controller';
import { SitesService } from './sites.service';
import { Site } from './sites.entity';
import { DailyData } from './daily-data.entity';
import { EntityExists } from '../validations/entity-exists.constraint';
import { AuthModule } from '../auth/auth.module';
import { Region } from '../regions/regions.entity';
import { ExclusionDates } from './exclusion-dates.entity';
import { SiteApplication } from '../site-applications/site-applications.entity';
import { User } from '../users/users.entity';
import { Sources } from './sources.entity';
import { HistoricalMonthlyMean } from './historical-monthly-mean.entity';
import { LatestData } from '../time-series/latest-data.entity';
import { TimeSeries } from '../time-series/time-series.entity';
import { ScheduledUpdate } from './scheduled-updates.entity';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      Site,
      SiteApplication,
      DailyData,
      Region,
      ExclusionDates,
      HistoricalMonthlyMean,
      User,
      Sources,
      LatestData,
      TimeSeries,
      ScheduledUpdate,
    ]),
  ],
  controllers: [SitesController],
  providers: [SitesService, EntityExists],
})
export class SitesModule {}
