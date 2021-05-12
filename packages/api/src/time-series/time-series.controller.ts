import {
  Controller,
  ParseArrayPipe,
  Get,
  Param,
  Query,
  ParseBoolPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
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

@ApiTags('Time Series')
@Controller('time-series')
export class TimeSeriesController {
  constructor(private timeSeriesService: TimeSeriesService) {}

  @ApiTimeSeriesResponse()
  @ApiOperation({
    summary:
      'Returns specified time series data for a specified reef point of interest',
  })
  @Get('reefs/:reefId/pois/:poiId')
  findPoiData(
    @Query('start', ParseDatePipe) startDate: Date,
    @Query('end', ParseDatePipe) endDate: Date,
    @Query('metrics', ParseArrayPipe) metrics: Metric[],
    @Query('hourly', ParseBoolPipe) hourly: boolean,
    @Param() poiDataDto: PoiDataDto,
  ) {
    return this.timeSeriesService.findPoiData(
      startDate,
      endDate,
      metrics,
      hourly,
      poiDataDto,
    );
  }

  @ApiTimeSeriesResponse()
  @ApiOperation({
    summary: 'Returns specified time series data for a specified reef',
  })
  @Get('reefs/:reefId')
  findReefData(
    @Query('start', ParseDatePipe) startDate: Date,
    @Query('end', ParseDatePipe) endDate: Date,
    @Query('metrics', ParseArrayPipe) metrics: Metric[],
    @Query('hourly', ParseBoolPipe) hourly: boolean,
    @Param() reefDataDto: ReefDataDto,
  ) {
    return this.timeSeriesService.findReefData(
      startDate,
      endDate,
      metrics,
      hourly,
      reefDataDto,
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
