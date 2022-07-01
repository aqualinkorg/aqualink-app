import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';

import { SensorDataService } from './sensor-data.service';

@Controller('sensor-data')
export class SensorDataController {
  constructor(private sensorDataService: SensorDataService) {}

  @ApiOperation({ summary: 'Get sofar data by sensorId' })
  @ApiQuery({ name: 'id', example: 'SPOT-0000' })
  @ApiQuery({ name: 'start', example: '2022-05-27' })
  @ApiQuery({ name: 'end', example: '2022-05-28' })
  @Get()
  findSensors(
    @Query('id') id: string,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    const startDate = start ? new Date(start) : undefined;
    const endDate = end ? new Date(end) : undefined;

    return this.sensorDataService.get(id, endDate, startDate);
  }
}
