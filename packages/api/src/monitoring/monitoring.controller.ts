import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from 'auth/auth.decorator';
import { AuthRequest } from 'auth/auth.types';
import { AdminLevel } from 'users/users.entity';
import { GetMonitoringStatsDto } from './dto/get-monitoring-stats.dto';
import { PostMonitoringMetricDto } from './dto/post-monitoring-metric.dto';
import { MonitoringService } from './monitoring.service';

@ApiTags('Monitoring')
@Controller('monitoring')
export class MonitoringController {
  constructor(private monitoringService: MonitoringService) {}

  @Post()
  @ApiOperation({ summary: 'Post a usage metric' })
  @Auth()
  postMonitoringMetric(
    @Body() postMonitoringMetricDto: PostMonitoringMetricDto,
    @Req() req: AuthRequest,
  ) {
    return this.monitoringService.postMonitoringMetric(
      postMonitoringMetricDto,
      req.user,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get usage metrics' })
  @Auth(AdminLevel.SuperAdmin)
  getMonitoringStats(@Query() getMonitoringStatsDto: GetMonitoringStatsDto) {
    return this.monitoringService.getMonitoringStats(getMonitoringStatsDto);
  }
}
