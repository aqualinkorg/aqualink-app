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
  ApiParam,
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
import { IsSiteAdminGuard } from '../auth/is-site-admin.guard';
import { AuthRequest } from '../auth/auth.types';
import { Public } from '../auth/public.decorator';
import { ApiFileUpload } from '../docs/api-properties';
import { ApiNestNotFoundResponse } from '../docs/api-response';

@ApiTags('Surveys')
@UseGuards(IsSiteAdminGuard)
@Auth(AdminLevel.SiteManager, AdminLevel.SuperAdmin)
@Controller('sites/:site_id/surveys')
export class SurveysController {
  constructor(private surveyService: SurveysService) {}

  @ApiBearerAuth()
  @ApiFileUpload()
  @ApiCreatedResponse({
    description: 'Returns the public url to access the uploaded media',
    schema: {
      type: 'string',
      example:
        'https://storage.googleapis.com/storage/reef-image-1029381082910831.jpg',
    },
  })
  @ApiOperation({ summary: 'Uploads a new survey media' })
  @ApiParam({ name: 'site_id', example: 1 })
  @Post('upload')
  @AcceptFile('file', ['image', 'video'], 'surveys', 'site')
  upload(
    @Param('site_id', ParseIntPipe) siteId: number,
    @UploadedFile('file') file: any,
  ): string {
    // Override file path because file.path provided an invalid google cloud format and HTTPS is not working correctly
    // Correct format of a URL pointing to a google cloud object should be
    // https://storage.googleapis.com/{bucketName}/path/to/object/in/bucket
    return `https://storage.googleapis.com/${process.env.GCS_BUCKET}/${file.filename}`;
  }

  @ApiBearerAuth()
  @ApiNestNotFoundResponse('No site was found with the specified id')
  @ApiOperation({ summary: 'Creates a new survey' })
  @ApiParam({ name: 'site_id', example: 1 })
  @Post()
  create(
    @Body() createSurveyDto: CreateSurveyDto,
    @Param('site_id', ParseIntPipe) siteId: number,
    @Req() req: AuthRequest,
  ): Promise<Survey> {
    return this.surveyService.create(createSurveyDto, req.user, siteId);
  }

  @ApiBearerAuth()
  @ApiNestNotFoundResponse('No survey was found with the specified id')
  @ApiOperation({ summary: 'Creates a new survey media' })
  @ApiParam({ name: 'site_id', example: 1 })
  @ApiParam({ name: 'id', example: 1 })
  @Post(':id/media')
  createMedia(
    @Body() createSurveyMediaDto: CreateSurveyMediaDto,
    @Param('site_id', ParseIntPipe) siteId: number,
    @Param('id', ParseIntPipe) surveyId: number,
  ): Promise<SurveyMedia> {
    return this.surveyService.createMedia(createSurveyMediaDto, surveyId);
  }

  @ApiOperation({ summary: "Returns all site's survey" })
  @ApiParam({ name: 'site_id', example: 1 })
  @Public()
  @Get()
  find(@Param('site_id', ParseIntPipe) siteId: number): Promise<Survey[]> {
    return this.surveyService.find(siteId);
  }

  @ApiNestNotFoundResponse('No survey was found with the specified id')
  @ApiOperation({ summary: 'Returns specified survey' })
  @ApiParam({ name: 'site_id', example: 1 })
  @ApiParam({ name: 'id', example: 1 })
  @Public()
  @Get(':id')
  findOne(
    @Param('site_id', ParseIntPipe) siteId: number,
    @Param('id', ParseIntPipe) surveyId: number,
  ): Promise<Survey> {
    return this.surveyService.findOne(surveyId);
  }

  @ApiOperation({ summary: 'Returns all media of a specified survey' })
  @ApiParam({ name: 'site_id', example: 1 })
  @ApiParam({ name: 'id', example: 1 })
  @Public()
  @Get(':id/media')
  findMedia(
    @Param('site_id', ParseIntPipe) siteId: number,
    @Param('id', ParseIntPipe) surveyId: number,
  ): Promise<SurveyMedia[]> {
    return this.surveyService.findMedia(surveyId);
  }

  @ApiBearerAuth()
  @ApiNestNotFoundResponse('No survey media was found with the specified id')
  @ApiOperation({ summary: 'Updates a specified survey media' })
  @ApiParam({ name: 'site_id', example: 1 })
  @ApiParam({ name: 'id', example: 1 })
  @Put('media/:id')
  updateMedia(
    @Param('site_id', ParseIntPipe) siteId: number,
    @Param('id', ParseIntPipe) mediaId: number,
    @Body() editSurveyMediaDto: EditSurveyMediaDto,
  ): Promise<SurveyMedia> {
    return this.surveyService.updateMedia(editSurveyMediaDto, mediaId);
  }

  @ApiBearerAuth()
  @ApiNestNotFoundResponse('No survey was found with the specified id')
  @ApiOperation({ summary: 'Updates a specified survey' })
  @ApiParam({ name: 'site_id', example: 1 })
  @ApiParam({ name: 'id', example: 1 })
  @Put(':id')
  update(
    @Param('site_id', ParseIntPipe) siteId: number,
    @Param('id', ParseIntPipe) surveyId: number,
    @Body() editSurveyDto: EditSurveyDto,
  ): Promise<Survey> {
    return this.surveyService.update(editSurveyDto, surveyId);
  }

  @ApiBearerAuth()
  @ApiNestNotFoundResponse('No survey was found with the specified id')
  @ApiOperation({ summary: 'Deletes a specified survey' })
  @ApiParam({ name: 'site_id', example: 1 })
  @ApiParam({ name: 'id', example: 1 })
  @Delete(':id')
  delete(
    @Param('site_id', ParseIntPipe) siteId: number,
    @Param('id', ParseIntPipe) surveyId: number,
  ): Promise<void> {
    return this.surveyService.delete(surveyId);
  }

  @ApiBearerAuth()
  @ApiNestNotFoundResponse('No survey media was found with the specified id')
  @ApiOperation({ summary: 'Deletes a specified survey media' })
  @ApiParam({ name: 'site_id', example: 1 })
  @ApiParam({ name: 'id', example: 1 })
  @Delete('media/:id')
  deleteMedia(
    @Param('site_id', ParseIntPipe) siteId: number,
    @Param('id', ParseIntPipe) mediaId: number,
  ): Promise<void> {
    return this.surveyService.deleteMedia(mediaId);
  }
}
