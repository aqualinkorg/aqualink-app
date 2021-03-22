import {
  Controller,
  ParseArrayPipe,
  Get,
  Param,
  Query,
  ParseBoolPipe,
} from '@nestjs/common';
import { ParseDatePipe } from '../pipes/parse-date.pipe';
import { ReefDataDto } from './dto/reef-data.dto';
import { PoiDataDto } from './dto/poi-data.dto';
import { Metric } from './metrics.entity';
import { TimeSeriesService } from './time-series.service';
import { PoiDataRangeDto } from './dto/poi-data-range.dto';
import { ReefDataRangeDto } from './dto/reef-data-range.dto';

@Controller('time-series')
export class TimeSeriesController {
  constructor(private timeSeriesService: TimeSeriesService) {}

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

  @Get('reefs/:reefId/pois/:poiId/range')
  findPoiDataRange(@Param() poiDataRangeDto: PoiDataRangeDto) {
    return this.timeSeriesService.findPoiDataRange(poiDataRangeDto);
  }

  @Get('reefs/:reefId/range')
  findReefDataRange(@Param() reefDataRangeDto: ReefDataRangeDto) {
    return this.timeSeriesService.findReefDataRange(reefDataRangeDto);
  }
}
