import { Controller, Get, Param, ParseArrayPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiNestNotFoundResponse } from '../docs/api-response';
import { ParseDatePipe } from '../pipes/parse-date.pipe';
import { Metric } from '../time-series/metrics.entity';
import { CoralAtlasService } from './coral-atlas.service';

@ApiTags('Coral Atlas')
@Controller('coral-atlas')
export class CoralAtlasController {
  constructor(private coralAtlasService: CoralAtlasService) {}

  @ApiOperation({ summary: 'Get all sites having sensors' })
  @Get('sensors')
  findSensors() {
    return this.coralAtlasService.findSensors();
  }

  @ApiNestNotFoundResponse('No data were found with the specified sensor id')
  @ApiOperation({ summary: 'Get data from a specified sensor' })
  @Get('sensors/:id/data')
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
  @Get('sensors/:id/surveys')
  findSensorSurveys(@Param('id') sensorId: string) {
    return this.coralAtlasService.findSensorSurveys(sensorId);
  }
}
