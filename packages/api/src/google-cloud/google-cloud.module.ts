import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoogleCloudService } from './google-cloud.service';
import { GoogleCloudController } from './google-cloud.controller';
import { AuthModule } from '../auth/auth.module';
import { SurveyMedia } from '../surveys/survey-media.entity';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([SurveyMedia])],
  providers: [GoogleCloudService],
  exports: [GoogleCloudService],
  controllers: [GoogleCloudController],
})
export class GoogleCloudModule {}
