import { Controller, Get, Param, ParseArrayPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApiNestNotFoundResponse } from '../docs/api-response';
import { ApiTimeSeriesResponse } from '../docs/api-time-series-response';
import { ParseDatePipe } from '../pipes/parse-date.pipe';
import { SensorsService } from './sensors.service';

@ApiTags('Sensors')
@Controller('sensors')
export class SensorsController {
  constructor(private coralAtlasService: SensorsService) {}

  @ApiOperation({ summary: 'Get all sites having sensors' })
  @Get()
  findSensors() {
    return this.coralAtlasService.findSensors();
  }

  @ApiTimeSeriesResponse()
  @ApiNestNotFoundResponse('No data were found with the specified sensor id')
  @ApiOperation({ summary: 'Get data from a specified sensor' })
  @ApiParam({ name: 'id', example: 'SPOT-0000' })
  @ApiQuery({ name: 'startDate', example: '2021-01-10T12:00:00Z' })
  @ApiQuery({ name: 'endDate', example: '2021-05-10T12:00:00Z' })
  @ApiQuery({
    name: 'metrics',
    example: ['bottom_temperature', 'top_temperature'],
  })
  @Get(':id/data')
  findSensorData(
    @Param('id') sensorId: string,
    @Query('metrics', ParseArrayPipe) metrics: string[],
    @Query('startDate', ParseDatePipe) startDate?: string,
    @Query('endDate', ParseDatePipe) endDate?: string,
  ) {
    return this.coralAtlasService.findSensorData(
      sensorId,
      metrics,
      startDate,
      endDate,
    );
  }

  @ApiNestNotFoundResponse('No surveys were found with the specified sensor id')
  @ApiOperation({
    summary: 'Get surveys and survey media from a specified sensor',
  })
  @ApiParam({ name: 'id', example: 'SPOT-0000' })
  @Get(':id/surveys')
  findSensorSurveys(@Param('id') sensorId: string) {
    return this.coralAtlasService.findSensorSurveys(sensorId);
  }
}
