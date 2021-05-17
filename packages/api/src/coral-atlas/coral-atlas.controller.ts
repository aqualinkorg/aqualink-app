import { Controller, Get, Param, ParseArrayPipe, Query } from '@nestjs/common';
import { ParseDatePipe } from '../pipes/parse-date.pipe';
import { Metric } from '../time-series/metrics.entity';
import { CoralAtlasService } from './coral-atlas.service';

@Controller('coral-atlas')
export class CoralAtlasController {
  constructor(private coralAtlasService: CoralAtlasService) {}

  @Get('sensors')
  findSensors() {
    return this.coralAtlasService.findSensors();
  }

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

  @Get('sensors/:id/surveys')
  findSensorSurveys(@Param('id') sensorId: string) {
    return this.coralAtlasService.findSensorSurveys(sensorId);
  }
}
