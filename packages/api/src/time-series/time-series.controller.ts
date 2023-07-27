import {
  Controller,
  Get,
  Param,
  Query,
  ParseBoolPipe,
  Post,
  UseInterceptors,
  UseGuards,
  UploadedFiles,
  Body,
  Res,
  Header,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { SiteDataDto } from './dto/site-data.dto';
import { SurveyPointDataDto } from './dto/survey-point-data.dto';
import { TimeSeriesService } from './time-series.service';
import { SurveyPointDataRangeDto } from './dto/survey-point-data-range.dto';
import { SiteDataRangeDto } from './dto/site-data-range.dto';
import {
  ApiTimeSeriesRangeResponse,
  ApiTimeSeriesResponse,
} from '../docs/api-time-series-response';
import { ParseDatePipe } from '../pipes/parse-date.pipe';
import { IsSiteAdminGuard } from '../auth/is-site-admin.guard';
import { AdminLevel } from '../users/users.entity';
import { Auth } from '../auth/auth.decorator';
import { SourceType } from '../sites/schemas/source-type.enum';
import { fileFilter } from '../utils/uploads/upload-sheet-data';
import { SampleUploadFilesDto } from './dto/sample-upload-files.dto';
import { Metric } from './metrics.enum';
import { MetricArrayPipe } from '../pipes/parse-metric-array.pipe';

const MAX_FILE_COUNT = 10;
const MAX_FILE_SIZE_MB = 10;

@ApiTags('Time Series')
@Controller('time-series')
export class TimeSeriesController {
  constructor(private timeSeriesService: TimeSeriesService) {}

  @ApiTimeSeriesResponse()
  @ApiOperation({
    summary:
      'Returns specified time series data for a specified site point of interest',
  })
  @ApiQuery({ name: 'start', example: '2021-05-18T10:20:28.017Z' })
  @ApiQuery({ name: 'end', example: '2021-05-18T10:20:28.017Z' })
  @ApiQuery({
    name: 'metrics',
    example: [Metric.BOTTOM_TEMPERATURE, Metric.TOP_TEMPERATURE],
  })
  @ApiQuery({ name: 'hourly', example: false, required: false })
  @Get('sites/:siteId/site-survey-points/:surveyPointId')
  findSurveyPointData(
    @Param() surveyPointDataDto: SurveyPointDataDto,
    @Query(
      'metrics',
      new MetricArrayPipe({
        predefinedSet: Object.values(Metric),
        defaultArray: Object.values(Metric),
      }),
    )
    metrics: Metric[],
    @Query('start', ParseDatePipe) startDate?: string,
    @Query('end', ParseDatePipe) endDate?: string,
    @Query('hourly') hourly?: boolean,
  ) {
    return this.timeSeriesService.findSurveyPointData(
      surveyPointDataDto,
      metrics,
      startDate,
      endDate,
      hourly,
    );
  }

  @ApiTimeSeriesResponse()
  @ApiOperation({
    summary: 'Returns specified time series data for a specified site',
  })
  @ApiQuery({ name: 'start', example: '2021-05-18T10:20:28.017Z' })
  @ApiQuery({ name: 'end', example: '2021-05-18T10:20:28.017Z' })
  @ApiQuery({
    name: 'metrics',
    example: [Metric.BOTTOM_TEMPERATURE, Metric.TOP_TEMPERATURE],
  })
  @ApiQuery({ name: 'hourly', example: false, required: false })
  @Get('sites/:siteId')
  findSiteData(
    @Param() siteDataDto: SiteDataDto,
    @Query(
      'metrics',
      new MetricArrayPipe({
        predefinedSet: Object.values(Metric),
        defaultArray: Object.values(Metric),
      }),
    )
    metrics: Metric[],
    @Query('start', ParseDatePipe) startDate?: string,
    @Query('end', ParseDatePipe) endDate?: string,
    @Query('hourly', ParseBoolPipe) hourly?: boolean,
  ) {
    return this.timeSeriesService.findSiteData(
      siteDataDto,
      metrics,
      startDate,
      endDate,
      hourly,
    );
  }

  @ApiTimeSeriesRangeResponse()
  @ApiOperation({
    summary:
      'Returns the range of the available time series data for a specified site point of interest',
  })
  @Get('sites/:siteId/site-survey-points/:surveyPointId/range')
  findSurveyPointDataRange(
    @Param() surveyPointDataRangeDto: SurveyPointDataRangeDto,
  ) {
    return this.timeSeriesService.findSurveyPointDataRange(
      surveyPointDataRangeDto,
    );
  }

  @ApiTimeSeriesRangeResponse()
  @ApiOperation({
    summary:
      'Returns the range of the available time series data for a specified site',
  })
  @Get('sites/:siteId/range')
  findSiteDataRange(@Param() siteDataRangeDto: SiteDataRangeDto) {
    return this.timeSeriesService.findSiteDataRange(siteDataRangeDto);
  }

  @ApiOperation({ summary: 'Upload time series data' })
  @UseGuards(IsSiteAdminGuard)
  @Auth(AdminLevel.SiteManager, AdminLevel.SuperAdmin)
  @Post('sites/:siteId/site-survey-points/:surveyPointId/upload')
  @UseInterceptors(
    FilesInterceptor('files', MAX_FILE_COUNT, {
      dest: './upload',
      fileFilter,
      limits: {
        fileSize: MAX_FILE_SIZE_MB * 10 ** 6,
      },
    }),
  )
  uploadTimeSeriesData(
    @Param() surveyPointDataRangeDto: SurveyPointDataRangeDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('sensor') sensor?: SourceType,
    @Query('failOnWarning', ParseBoolPipe) failOnWarning?: boolean,
  ) {
    return this.timeSeriesService.uploadData(
      surveyPointDataRangeDto,
      sensor,
      files,
      failOnWarning,
    );
  }

  @ApiOperation({ summary: 'Get sample upload files' })
  @Get('sample-upload-files/:source')
  @Header('Content-Type', 'text/csv')
  getSampleUploadFiles(
    @Param() surveyPointDataRangeDto: SampleUploadFilesDto,
    @Res() res: Response,
  ) {
    const file = this.timeSeriesService.getSampleUploadFiles(
      surveyPointDataRangeDto,
    );
    const filename = `${surveyPointDataRangeDto.source}_example.csv`;
    res.set({
      'Content-Disposition': `attachment; filename=${encodeURIComponent(
        filename,
      )}`,
    });
    return file.pipe(res);
  }

  @ApiOperation({
    summary: 'Returns specified time series data for a specified site as csv',
  })
  @ApiQuery({ name: 'start', example: '2021-05-18T10:20:28.017Z' })
  @ApiQuery({ name: 'end', example: '2021-05-18T10:20:28.017Z' })
  @ApiQuery({
    name: 'metrics',
    example: [Metric.BOTTOM_TEMPERATURE, Metric.TOP_TEMPERATURE],
  })
  @ApiQuery({ name: 'hourly', example: false, required: false })
  @Header('Content-Type', 'text/csv')
  @Get('sites/:siteId/csv')
  findSiteDataCsv(
    @Res() res: Response,
    @Param() siteDataDto: SiteDataDto,
    @Query(
      'metrics',
      new MetricArrayPipe({
        predefinedSet: Object.values(Metric),
        defaultArray: Object.values(Metric),
      }),
    )
    metrics: Metric[],
    @Query('start', ParseDatePipe) startDate?: string,
    @Query('end', ParseDatePipe) endDate?: string,
    @Query('hourly', ParseBoolPipe) hourly?: boolean,
  ) {
    if (startDate && endDate && startDate > endDate) {
      throw new BadRequestException(
        `Invalid Dates: start date can't be after end date`,
      );
    }
    return this.timeSeriesService.findSiteDataCsv(
      res,
      siteDataDto,
      metrics,
      startDate,
      endDate,
      hourly,
    );
  }
}
