import {
  Controller,
  Get,
  Param,
  Query,
  ParseBoolPipe,
  ParseArrayPipe,
  DefaultValuePipe,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SiteDataDto } from './dto/site-data.dto';
import { SurveyPointDataDto } from './dto/survey-point-data.dto';
import { Metric } from './metrics.entity';
import { TimeSeriesService } from './time-series.service';
import { SurveyPointDataRangeDto } from './dto/survey-point-data-range.dto';
import { SiteDataRangeDto } from './dto/site-data-range.dto';
import {
  ApiTimeSeriesRangeResponse,
  ApiTimeSeriesResponse,
} from '../docs/api-time-series-response';
import { ParseDatePipe } from '../pipes/parse-date.pipe';

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
  @ApiQuery({ name: 'hourly', example: false })
  @Get('sites/:siteId/site-survey-points/:surveyPointId')
  findSurveyPointData(
    @Param() surveyPointDataDto: SurveyPointDataDto,
    @Query(
      'metrics',
      new DefaultValuePipe(Object.values(Metric)),
      ParseArrayPipe,
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
  @ApiQuery({ name: 'hourly', example: false })
  @Get('sites/:siteId')
  findSiteData(
    @Param() siteDataDto: SiteDataDto,
    @Query(
      'metrics',
      new DefaultValuePipe(Object.values(Metric)),
      ParseArrayPipe,
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
  @Post('sites/:siteId/site-survey-points/:surveyPointId/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      dest: './upload',
    }),
  )
  uploadTimeSeriesData(
    @Param() surveyPointDataRangeDto: SurveyPointDataRangeDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.timeSeriesService.uploadData(
      surveyPointDataRangeDto,
      `./upload/${file.filename}`,
    );
  }
}
