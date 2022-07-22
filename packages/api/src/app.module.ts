import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { configService } from './config/config.service';
import { SiteApplicationsModule } from './site-applications/site-applications.module';
import { SitesModule } from './sites/sites.module';
import { SiteSurveyPointsModule } from './site-survey-points/site-survey-points.module';
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
import { DataUploadsModule } from './data-uploads/data-uploads.module';
import { SiteSketchFabModule } from './site-sketchfab/site-sketchfab.module';
import { WindWaveModule } from './wind-wave-data/wind-wave-data.module';
import { SensorDataModule } from './sensor-data/sensor-data.module';

@Module({
  imports: [
    SiteApplicationsModule,
    SitesModule,
    SiteSurveyPointsModule,
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
    DataUploadsModule,
    SiteSketchFabModule,
    WindWaveModule,
    SensorDataModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
