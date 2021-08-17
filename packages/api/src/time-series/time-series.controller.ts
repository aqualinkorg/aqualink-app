import { Controller, ParseArrayPipe, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ParseDatePipe } from '../pipes/parse-date.pipe';
import { ReefDataDto } from './dto/reef-data.dto';
import { PoiDataDto } from './dto/poi-data.dto';
import { Metric } from './metrics.entity';
import { TimeSeriesService } from './time-series.service';
import { PoiDataRangeDto } from './dto/poi-data-range.dto';
import { ReefDataRangeDto } from './dto/reef-data-range.dto';
import {
  ApiTimeSeriesRangeResponse,
  ApiTimeSeriesResponse,
} from '../docs/api-time-series-response';
import { TimeSeriesGrouping } from '../utils/time-series.utils';

@ApiTags('Time Series')
@Controller('time-series')
export class TimeSeriesController {
  constructor(private timeSeriesService: TimeSeriesService) {}

  @ApiTimeSeriesResponse()
  @ApiOperation({
    summary:
      'Returns specified time series data for a specified reef point of interest',
  })
  @ApiQuery({ name: 'start', example: '2021-05-18T10:20:28.017Z' })
  @ApiQuery({ name: 'end', example: '2021-05-18T10:20:28.017Z' })
  @ApiQuery({
    name: 'metrics',
    example: [Metric.BOTTOM_TEMPERATURE, Metric.TOP_TEMPERATURE],
  })
  @ApiQuery({ name: 'grouping', example: false, required: false })
  @Get('reefs/:reefId/pois/:poiId')
  findPoiData(
    @Param() poiDataDto: PoiDataDto,
    @Query('start', ParseDatePipe) startDate: Date,
    @Query('end', ParseDatePipe) endDate: Date,
    @Query('metrics', ParseArrayPipe) metrics: Metric[],
    @Query('grouping') grouping?: TimeSeriesGrouping,
  ) {
    return this.timeSeriesService.findPoiData(
      startDate,
      endDate,
      metrics,
      poiDataDto,
      grouping,
    );
  }

  @ApiTimeSeriesResponse()
  @ApiOperation({
    summary: 'Returns specified time series data for a specified reef',
  })
  @ApiQuery({ name: 'start', example: '2021-05-18T10:20:28.017Z' })
  @ApiQuery({ name: 'end', example: '2021-05-18T10:20:28.017Z' })
  @ApiQuery({
    name: 'metrics',
    example: [Metric.BOTTOM_TEMPERATURE, Metric.TOP_TEMPERATURE],
  })
  @ApiQuery({ name: 'grouping', example: false, required: false })
  @Get('reefs/:reefId')
  findReefData(
    @Param() reefDataDto: ReefDataDto,
    @Query('start', ParseDatePipe) startDate: Date,
    @Query('end', ParseDatePipe) endDate: Date,
    @Query('metrics', ParseArrayPipe) metrics: Metric[],
    @Query('grouping') grouping?: TimeSeriesGrouping,
  ) {
    return this.timeSeriesService.findReefData(
      startDate,
      endDate,
      metrics,
      reefDataDto,
      grouping,
    );
  }

  @ApiTimeSeriesRangeResponse()
  @ApiOperation({
    summary:
      'Returns the range of the available time series data for a specified reef point of interest',
  })
  @Get('reefs/:reefId/pois/:poiId/range')
  findPoiDataRange(@Param() poiDataRangeDto: PoiDataRangeDto) {
    return this.timeSeriesService.findPoiDataRange(poiDataRangeDto);
  }

  @ApiTimeSeriesRangeResponse()
  @ApiOperation({
    summary:
      'Returns the range of the available time series data for a specified reef',
  })
  @Get('reefs/:reefId/range')
  findReefDataRange(@Param() reefDataRangeDto: ReefDataRangeDto) {
    return this.timeSeriesService.findReefDataRange(reefDataRangeDto);
  }
}
