import {
  Body,
  Controller,
  ParseArrayPipe,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ParseDatePipe } from '../pipes/parse-date.pipe';
import { ReefDataDto } from './dto/reef-data.dto';
import { PoiDataDto } from './dto/poi-data.dto';
import { Metric } from './metrics.entity';
import { TimeSeriesService } from './time-series.service';
import { DataRangeDto } from './dto/data-range.dto';

@Controller('time-series')
export class TimeSeriesController {
  constructor(private timeSeriesService: TimeSeriesService) {}

  @Get('reefs/:reefId/pois/:poiId')
  findPoiData(
    @Query('start', ParseDatePipe) startDate: Date,
    @Query('end', ParseDatePipe) endDate: Date,
    @Query('metrics', ParseArrayPipe) metrics: Metric[],
    @Param() poiDataDto: PoiDataDto,
  ) {
    return this.timeSeriesService.findPoiData(
      startDate,
      endDate,
      metrics,
      poiDataDto,
    );
  }

  @Get('reefs/:reefId')
  findReefData(
    @Query('start', ParseDatePipe) startDate: Date,
    @Query('end', ParseDatePipe) endDate: Date,
    @Query('metrics', ParseArrayPipe) metrics: Metric[],
    @Param() reefDataDto: ReefDataDto,
  ) {
    return this.timeSeriesService.findReefData(
      startDate,
      endDate,
      metrics,
      reefDataDto,
    );
  }

  @Get('reefs/:reefId/pois/:poiId/range')
  findDataRange(@Param() dataRangeDto: DataRangeDto) {
    return this.timeSeriesService.findDataRange(dataRangeDto);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadHoboData(@Body('aliases') aliases: string, @UploadedFile() file) {
    const parsedAliases = JSON.parse(aliases);
    return this.timeSeriesService.uploadHoboData(file, parsedAliases);
  }
}
