import { Controller, Get, Param, ParseArrayPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCloudAtlasSensorsResponse } from '../docs/api-cloud-atlas-response';
import { ApiNestNotFoundResponse } from '../docs/api-response';
import { ApiTimeSeriesResponse } from '../docs/api-time-series-response';
import { ParseDatePipe } from '../pipes/parse-date.pipe';
import { Metric } from '../time-series/metrics.entity';
import { SensorsService } from './sensors.service';

@ApiTags('Sensors')
@Controller('sensors')
export class SensorsController {
  constructor(private coralAtlasService: SensorsService) {}

  @ApiCloudAtlasSensorsResponse()
  @ApiOperation({ summary: 'Get all sites having sensors' })
  @Get()
  findSensors() {
    return this.coralAtlasService.findSensors();
  }

  @ApiTimeSeriesResponse()
  @ApiNestNotFoundResponse('No data were found with the specified sensor id')
  @ApiOperation({ summary: 'Get data from a specified sensor' })
  @Get(':id/data')
  findSensorData(
    @Param('id') sensorId: string,
    @Query('startDate', ParseDatePipe) startDate: Date,
    @Query('endDate', ParseDatePipe) endDate: Date,
    @Query('metrics', ParseArrayPipe) metrics: Metric[],
  ) {
    return this.coralAtlasService.findSensorData(
      sensorId,
      startDate,
      endDate,
      metrics,
    );
  }

  @ApiNestNotFoundResponse('No surveys were found with the specified sensor id')
  @ApiOperation({
    summary: 'Get surveys and survey media from a specified sensor',
  })
  @Get(':id/surveys')
  findSensorSurveys(@Param('id') sensorId: string) {
    return this.coralAtlasService.findSensorSurveys(sensorId);
  }
}
