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
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
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
import { fileFilter } from '../uploads/file.filter';

@ApiTags('Surveys')
@UseGuards(IsSiteAdminGuard)
@Auth(AdminLevel.SiteManager, AdminLevel.SuperAdmin)
@Controller('sites/:siteId/surveys')
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
  @ApiParam({ name: 'siteId', example: 1 })
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', { fileFilter: fileFilter(['image', 'video']) }),
  )
  upload(
    @Param('siteId', ParseIntPipe) siteId: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{
    url: string;
    thumbnailUrl?: string | undefined;
  }> {
    return this.surveyService.upload(file);
  }

  @ApiBearerAuth()
  @ApiNestNotFoundResponse('No site was found with the specified id')
  @ApiOperation({ summary: 'Creates a new survey' })
  @ApiParam({ name: 'siteId', example: 1 })
  @Post()
  create(
    @Body() createSurveyDto: CreateSurveyDto,
    @Param('siteId', ParseIntPipe) siteId: number,
    @Req() req: AuthRequest,
  ): Promise<Survey> {
    return this.surveyService.create(createSurveyDto, req.user, siteId);
  }

  @ApiBearerAuth()
  @ApiNestNotFoundResponse('No survey was found with the specified id')
  @ApiOperation({ summary: 'Creates a new survey media' })
  @ApiParam({ name: 'siteId', example: 1 })
  @ApiParam({ name: 'id', example: 1 })
  @Post(':id/media')
  createMedia(
    @Body() createSurveyMediaDto: CreateSurveyMediaDto,
    @Param('siteId', ParseIntPipe) siteId: number,
    @Param('id', ParseIntPipe) surveyId: number,
  ): Promise<SurveyMedia> {
    return this.surveyService.createMedia(createSurveyMediaDto, surveyId);
  }

  @ApiOperation({ summary: "Returns all site's survey" })
  @ApiParam({ name: 'siteId', example: 1 })
  @Public()
  @Get()
  find(@Param('siteId', ParseIntPipe) siteId: number): Promise<Survey[]> {
    return this.surveyService.find(siteId);
  }

  @ApiNestNotFoundResponse('No survey was found with the specified id')
  @ApiOperation({ summary: 'Returns specified survey' })
  @ApiParam({ name: 'siteId', example: 1 })
  @ApiParam({ name: 'id', example: 1 })
  @Public()
  @Get(':id')
  findOne(
    @Param('siteId', ParseIntPipe) siteId: number,
    @Param('id', ParseIntPipe) surveyId: number,
  ): Promise<Survey> {
    return this.surveyService.findOne(surveyId);
  }

  @ApiOperation({ summary: 'Returns all media of a specified survey' })
  @ApiParam({ name: 'siteId', example: 1 })
  @ApiParam({ name: 'id', example: 1 })
  @Public()
  @Get(':id/media')
  findMedia(
    @Param('siteId', ParseIntPipe) siteId: number,
    @Param('id', ParseIntPipe) surveyId: number,
  ): Promise<SurveyMedia[]> {
    return this.surveyService.findMedia(surveyId);
  }

  @ApiBearerAuth()
  @ApiNestNotFoundResponse('No survey media was found with the specified id')
  @ApiOperation({ summary: 'Updates a specified survey media' })
  @ApiParam({ name: 'siteId', example: 1 })
  @ApiParam({ name: 'id', example: 1 })
  @Put('media/:id')
  updateMedia(
    @Param('siteId', ParseIntPipe) siteId: number,
    @Param('id', ParseIntPipe) mediaId: number,
    @Body() editSurveyMediaDto: EditSurveyMediaDto,
  ): Promise<SurveyMedia> {
    return this.surveyService.updateMedia(editSurveyMediaDto, mediaId);
  }

  @ApiBearerAuth()
  @ApiNestNotFoundResponse('No survey was found with the specified id')
  @ApiOperation({ summary: 'Updates a specified survey' })
  @ApiParam({ name: 'siteId', example: 1 })
  @ApiParam({ name: 'id', example: 1 })
  @Put(':id')
  update(
    @Param('siteId', ParseIntPipe) siteId: number,
    @Param('id', ParseIntPipe) surveyId: number,
    @Body() editSurveyDto: EditSurveyDto,
  ): Promise<Survey> {
    return this.surveyService.update(editSurveyDto, surveyId);
  }

  @ApiBearerAuth()
  @ApiNestNotFoundResponse('No survey was found with the specified id')
  @ApiOperation({ summary: 'Deletes a specified survey' })
  @ApiParam({ name: 'siteId', example: 1 })
  @ApiParam({ name: 'id', example: 1 })
  @Delete(':id')
  delete(
    @Param('siteId', ParseIntPipe) siteId: number,
    @Param('id', ParseIntPipe) surveyId: number,
  ): Promise<void> {
    return this.surveyService.delete(surveyId);
  }

  @ApiBearerAuth()
  @ApiNestNotFoundResponse('No survey media was found with the specified id')
  @ApiOperation({ summary: 'Deletes a specified survey media' })
  @ApiParam({ name: 'siteId', example: 1 })
  @ApiParam({ name: 'id', example: 1 })
  @Delete('media/:id')
  deleteMedia(
    @Param('siteId', ParseIntPipe) siteId: number,
    @Param('id', ParseIntPipe) mediaId: number,
  ): Promise<void> {
    return this.surveyService.deleteMedia(mediaId);
  }
}
