import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Site } from 'sites/sites.entity';
import { Survey } from 'surveys/surveys.entity';
import { ReefCheckSurvey } from 'reef-check-surveys/reef-check-surveys.entity';
import { SiteSurveyPoint } from 'site-survey-points/site-survey-points.entity';
import { MetadataService } from './metadata.service';
import { MetadataController } from './metadata.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Site, SiteSurveyPoint, Survey, ReefCheckSurvey]),
  ],
  providers: [MetadataService],
  controllers: [MetadataController],
})
export class MetadataModule {}
