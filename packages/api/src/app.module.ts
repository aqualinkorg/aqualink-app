import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { configService } from './config/config.service';
import { SiteApplicationsModule } from './site-applications/site-applications.module';
import { SitesModule } from './sites/sites.module';
import { SitePoisModule } from './site-pois/site-pois.module';
import { RegionsModule } from './regions/regions.module';
import { SurveysModule } from './surveys/surveys.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { GoogleCloudModule } from './google-cloud/google-cloud.module';
import { TasksModule } from './tasks/tasks.module';
import { HealthCheckModule } from './health-check/health-check.module';
import { TimeSeriesModule } from './time-series/time-series.module';
import { CollectionsModule } from './collections/collections.module';
import { SensorsModule } from './sensors/sensors.module';
import { AppController } from './app.controller';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    SiteApplicationsModule,
    SitesModule,
    SitePoisModule,
    RegionsModule,
    SurveysModule,
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    UsersModule,
    AuthModule,
    GoogleCloudModule,
    ScheduleModule.forRoot(),
    TasksModule,
    HealthCheckModule,
    TimeSeriesModule,
    CollectionsModule,
    SensorsModule,
    AuditModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
