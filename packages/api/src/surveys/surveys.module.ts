import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SurveysController } from './surveys.controller';
import { Survey } from './surveys.entity';
import { EntityExists } from '../validations/entity-exists.constraint';
import { AuthModule } from '../auth/auth.module';
import { SurveysService } from './surveys.service';
import { SurveyMedia } from './survey-media.entity';
import { Reef } from '../reefs/reefs.entity';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Survey, SurveyMedia, Reef])],
  controllers: [SurveysController],
  providers: [EntityExists, SurveysService],
})
export class SurveysModule {}
