import {
  Controller,
  Post,
  UploadedFile,
  Body,
  Req,
  Param,
  ParseIntPipe,
  Get,
} from '@nestjs/common';
import { AcceptFile } from '../uploads/file.decorator';
import { Auth } from '../auth/auth.decorator';
import { AdminLevel } from '../users/users.entity';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { Survey } from './surveys.entity';
import { SurveysService } from './surveys.service';
import { CreateSurveyMediaDto } from './dto/create-survey-media.dto';
import { SurveyMedia } from './survey-media.entity';

@Controller('surveys')
export class SurveysController {
  constructor(private surveyService: SurveysService) {}

  @Auth(AdminLevel.ReefManager, AdminLevel.SuperAdmin)
  @Post('upload')
  @AcceptFile('file', ['image', 'video'], 'surveys', 'reef')
  upload(@UploadedFile('file') file: any): Promise<string> {
    return file.path;
  }

  @Auth(AdminLevel.ReefManager, AdminLevel.SuperAdmin)
  @Post()
  create(
    @Body() createSurveyDto: CreateSurveyDto,
    @Req() req: any,
  ): Promise<Survey> {
    return this.surveyService.create(createSurveyDto, req.user);
  }

  @Auth(AdminLevel.ReefManager, AdminLevel.SuperAdmin)
  @Post(':id/media')
  createMedia(
    @Body() createSurveyMediaDto: CreateSurveyMediaDto,
    @Param('id', ParseIntPipe) surveyId: number,
  ): Promise<SurveyMedia> {
    return this.surveyService.createMedia(createSurveyMediaDto, surveyId);
  }

  @Get('reefs/:id')
  findOne(@Param('id', ParseIntPipe) reefId: number): Promise<any> {
    return this.surveyService.find(reefId);
  }
}
