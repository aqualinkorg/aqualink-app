import {
  Controller,
  ParseArrayPipe,
  Get,
  Param,
  Query,
  ParseBoolPipe,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ParseDatePipe } from '../pipes/parse-date.pipe';
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
    @Query('start', ParseDatePipe) startDate: Date,
    @Query('end', ParseDatePipe) endDate: Date,
    @Query('metrics', ParseArrayPipe) metrics: Metric[],
    @Query('hourly', ParseBoolPipe) hourly: boolean,
    @Param() surveyPointDataDto: SurveyPointDataDto,
  ) {
    return this.timeSeriesService.findSurveyPointData(
      startDate,
      endDate,
      metrics,
      hourly,
      surveyPointDataDto,
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
    @Query('start', ParseDatePipe) startDate: Date,
    @Query('end', ParseDatePipe) endDate: Date,
    @Query('hourly', ParseBoolPipe) hourly: boolean,
    @Param() siteDataDto: SiteDataDto,
    @Query(
      'metrics',
      new ParseArrayPipe({
        optional: true,
        items: String,
        separator: ',',
      }),
    )
    metrics: Metric[],
  ) {
    return this.timeSeriesService.findSiteData(
      startDate,
      endDate,
      metrics,
      hourly,
      siteDataDto,
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
}
