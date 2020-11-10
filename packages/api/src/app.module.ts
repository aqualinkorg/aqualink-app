import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { configService } from './config/config.service';
import { ReefApplicationsModule } from './reef-applications/reef-applications.module';
import { ReefsModule } from './reefs/reefs.module';
import { ReefPoisModule } from './reef-pois/reef-pois.module';
import { RegionsModule } from './regions/regions.module';
import { SurveysModule } from './surveys/surveys.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { GoogleCloudModule } from './google-cloud/google-cloud.module';
import { TasksModule } from './tasks/tasks.module';
import { HealthCheckModule } from './health-check/health-check.module';

@Module({
  imports: [
    ReefApplicationsModule,
    ReefsModule,
    ReefPoisModule,
    RegionsModule,
    SurveysModule,
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    UsersModule,
    AuthModule,
    GoogleCloudModule,
    ScheduleModule.forRoot(),
    TasksModule,
    HealthCheckModule,
  ],
})
export class AppModule {}
