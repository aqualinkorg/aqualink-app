import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteSurveyPointsController } from './site-survey-points.controller';
import { SiteSurveyPointsService } from './site-survey-points.service';
import { SiteSurveyPoint } from './site-survey-points.entity';
import { EntityExists } from '../validations/entity-exists.constraint';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([SiteSurveyPoint])],
  controllers: [SiteSurveyPointsController],
  providers: [SiteSurveyPointsService, EntityExists],
})
export class SiteSurveyPointsModule {}
