import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReefsController } from './reefs.controller';
import { ReefsService } from './reefs.service';
import { Reef } from './reefs.entity';
import { DailyData } from './daily-data.entity';
import { EntityExists } from '../validations/entity-exists.constraint';
import { AuthModule } from '../auth/auth.module';
import { Region } from '../regions/regions.entity';
import { ExclusionDates } from './exclusion-dates.entity';
import { ReefApplication } from '../reef-applications/reef-applications.entity';
import { User } from '../users/users.entity';
import { Sources } from './sources.entity';
import { HistoricalMonthlyMean } from './historical-monthly-mean.entity';
import { LatestData } from '../time-series/latest-data.entity';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      Reef,
      ReefApplication,
      DailyData,
      Region,
      ExclusionDates,
      HistoricalMonthlyMean,
      User,
      Sources,
      LatestData,
    ]),
  ],
  controllers: [ReefsController],
  providers: [ReefsService, EntityExists],
})
export class ReefsModule {}
