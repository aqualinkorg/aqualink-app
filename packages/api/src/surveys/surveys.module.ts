import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SurveysController } from './surveys.controller';
import { Survey } from './surveys.entity';
import { AuthModule } from '../auth/auth.module';
import { SurveysService } from './surveys.service';
import { SurveyMedia } from './survey-media.entity';
import { SiteSurveyPoint } from '../site-survey-points/site-survey-points.entity';
import { GoogleCloudModule } from '../google-cloud/google-cloud.module';
import { GoogleCloudService } from '../google-cloud/google-cloud.service';
import { Site } from '../sites/sites.entity';
import { DataUploads } from '../data-uploads/data-uploads.entity';

@Module({
  imports: [
    AuthModule,
    GoogleCloudModule,
    // Since we use GoogleCloudModule here the TypeOrmModule list should meet the requirements of GoogleCloudModule
    TypeOrmModule.forFeature([
      Survey,
      SurveyMedia,
      SiteSurveyPoint,
      Site,
      DataUploads,
    ]),
  ],
  controllers: [SurveysController],
  providers: [SurveysService, GoogleCloudService],
})
export class SurveysModule {}
