import { Controller, Get, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Auth } from 'auth/auth.decorator';
import { AuthRequest } from 'auth/auth.types';
import { AdminLevel } from 'users/users.entity';

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
    return this.sensorDataService.get(id, start, end);
  }

  @ApiBearerAuth()
  @Auth(AdminLevel.SiteManager, AdminLevel.SuperAdmin)
  @ApiOperation({ summary: 'Get sensor status information' })
  @ApiQuery({ name: 'siteId', example: '1063' })
  @ApiQuery({ name: 'sensorId', example: 'SPOT-0000' })
  @Get('info')
  sensorInfo(
    @Req() request: AuthRequest,
    @Query('siteId') siteId?: number,
    @Query('sensorId') sensorId?: string,
  ) {
    return this.sensorDataService.getSensorInfo(siteId, sensorId, request.user);
  }
}
