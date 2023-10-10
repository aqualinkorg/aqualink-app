import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoogleCloudService } from './google-cloud.service';
import { GoogleCloudController } from './google-cloud.controller';
import { AuthModule } from '../auth/auth.module';
import { SurveyMedia } from '../surveys/survey-media.entity';
import { DataUploads } from '../data-uploads/data-uploads.entity';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([DataUploads, SurveyMedia])],
  providers: [GoogleCloudService],
  exports: [GoogleCloudService],
  controllers: [GoogleCloudController],
})
export class GoogleCloudModule {}
