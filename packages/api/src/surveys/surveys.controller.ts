import {
  Controller,
  Post,
  UploadedFile,
  Body,
  Req,
  Param,
  ParseIntPipe,
  Get,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AcceptFile } from '../uploads/file.decorator';
import { Auth } from '../auth/auth.decorator';
import { AdminLevel } from '../users/users.entity';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { Survey } from './surveys.entity';
import { SurveysService } from './surveys.service';
import { CreateSurveyMediaDto } from './dto/create-survey-media.dto';
import { SurveyMedia } from './survey-media.entity';
import { EditSurveyDto } from './dto/edit-survey.dto';
import { EditSurveyMediaDto } from './dto/edit-survey-media.dto';
import { IsReefAdminGuard } from '../auth/is-reef-admin.guard';
import { AuthRequest } from '../auth/auth.types';
import { Public } from '../auth/public.decorator';
import { ApiFileUpload } from '../docs/api-properties';
import { ApiNestNotFoundResponse } from '../docs/api-response';

@ApiTags('Surveys')
@UseGuards(IsReefAdminGuard)
@Auth(AdminLevel.ReefManager, AdminLevel.SuperAdmin)
@Controller('reefs/:reef_id/surveys')
export class SurveysController {
  constructor(private surveyService: SurveysService) {}

  @ApiBearerAuth()
  @ApiFileUpload()
  @ApiCreatedResponse({
    description: 'Returns the public url to access the uploaded media',
    type: String,
  })
  @ApiOperation({ summary: 'Uploads a new survey media' })
  @Post('upload')
  @AcceptFile('file', ['image', 'video'], 'surveys', 'reef')
  upload(
    @Param('reef_id', ParseIntPipe) reefId: number,
    @UploadedFile('file') file: any,
  ): string {
    // Override file path because file.path provided an invalid google cloud format and HTTPS is not working correctly
    // Correct format of a URL pointing to a google cloud object should be
    // https://storage.googleapis.com/{bucketName}/path/to/object/in/bucket
    return `https://storage.googleapis.com/${process.env.GCS_BUCKET}/${file.filename}`;
  }

  @ApiBearerAuth()
  @ApiNestNotFoundResponse('No reef was found with the specified id')
  @ApiOperation({ summary: 'Creates a new survey' })
  @Post()
  create(
    @Body() createSurveyDto: CreateSurveyDto,
    @Param('reef_id', ParseIntPipe) reefId: number,
    @Req() req: AuthRequest,
  ): Promise<Survey> {
    return this.surveyService.create(createSurveyDto, req.user, reefId);
  }

  @ApiBearerAuth()
  @ApiNestNotFoundResponse('No survey was found with the specified id')
  @ApiOperation({ summary: 'Creates a new survey media' })
  @Post(':id/media')
  createMedia(
    @Body() createSurveyMediaDto: CreateSurveyMediaDto,
    @Param('reef_id', ParseIntPipe) reefId: number,
    @Param('id', ParseIntPipe) surveyId: number,
  ): Promise<SurveyMedia> {
    return this.surveyService.createMedia(createSurveyMediaDto, surveyId);
  }

  @ApiOperation({ summary: "Returns all reef's survey" })
  @Public()
  @Get()
  find(@Param('reef_id', ParseIntPipe) reefId: number): Promise<Survey[]> {
    return this.surveyService.find(reefId);
  }

  @ApiNestNotFoundResponse('No survey was found with the specified id')
  @ApiOperation({ summary: 'Returns specified survey' })
  @Public()
  @Get(':id')
  findOne(
    @Param('reef_id', ParseIntPipe) reefId: number,
    @Param('id', ParseIntPipe) surveyId: number,
  ): Promise<Survey> {
    return this.surveyService.findOne(surveyId);
  }

  @ApiOperation({ summary: 'Returns all media of a specified survey' })
  @Public()
  @Get(':id/media')
  findMedia(
    @Param('reef_id', ParseIntPipe) reefId: number,
    @Param('id', ParseIntPipe) surveyId,
  ): Promise<SurveyMedia[]> {
    return this.surveyService.findMedia(surveyId);
  }

  @ApiBearerAuth()
  @ApiNestNotFoundResponse('No survey media was found with the specified id')
  @ApiOperation({ summary: 'Updates a specified survey media' })
  @Put('media/:id')
  updateMedia(
    @Param('reef_id', ParseIntPipe) reefId: number,
    @Param('id', ParseIntPipe) mediaId: number,
    @Body() editSurveyMediaDto: EditSurveyMediaDto,
  ): Promise<SurveyMedia> {
    return this.surveyService.updateMedia(editSurveyMediaDto, mediaId);
  }

  @ApiBearerAuth()
  @ApiNestNotFoundResponse('No survey was found with the specified id')
  @ApiOperation({ summary: 'Updates a specified survey' })
  @Put(':id')
  update(
    @Param('reef_id', ParseIntPipe) reefId: number,
    @Param('id', ParseIntPipe) surveyId: number,
    @Body() editSurveyDto: EditSurveyDto,
  ): Promise<Survey> {
    return this.surveyService.update(editSurveyDto, surveyId);
  }

  @ApiBearerAuth()
  @ApiNestNotFoundResponse('No survey was found with the specified id')
  @ApiOperation({ summary: 'Deletes a specified survey' })
  @Delete(':id')
  delete(
    @Param('reef_id', ParseIntPipe) reefId: number,
    @Param('id', ParseIntPipe) surveyId: number,
  ): Promise<void> {
    return this.surveyService.delete(surveyId);
  }

  @ApiBearerAuth()
  @ApiNestNotFoundResponse('No survey media was found with the specified id')
  @ApiOperation({ summary: 'Deletes a specified survey media' })
  @Delete('media/:id')
  deleteMedia(
    @Param('reef_id', ParseIntPipe) reefId: number,
    @Param('id', ParseIntPipe) mediaId: number,
  ): Promise<void> {
    return this.surveyService.deleteMedia(mediaId);
  }
}
