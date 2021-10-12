import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SurveysController } from './surveys.controller';
import { Survey } from './surveys.entity';
import { EntityExists } from '../validations/entity-exists.constraint';
import { AuthModule } from '../auth/auth.module';
import { SurveysService } from './surveys.service';
import { SurveyMedia } from './survey-media.entity';
import { SiteSurveyPoint } from '../site-survey-points/site-survey-points.entity';
import { GoogleCloudModule } from '../google-cloud/google-cloud.module';
import { GoogleCloudService } from '../google-cloud/google-cloud.service';
import { Site } from '../sites/sites.entity';

@Module({
  imports: [
    AuthModule,
    GoogleCloudModule,
    TypeOrmModule.forFeature([Survey, SurveyMedia, SiteSurveyPoint, Site]),
  ],
  controllers: [SurveysController],
  providers: [EntityExists, SurveysService, GoogleCloudService],
})
export class SurveysModule {}
