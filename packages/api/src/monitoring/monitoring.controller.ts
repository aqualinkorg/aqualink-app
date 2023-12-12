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
  @Auth(AdminLevel.SuperAdmin, AdminLevel.SiteManager)
  getMonitoringStats(
    @Query() getMonitoringStatsDto: GetMonitoringStatsDto,
    @Req() req: AuthRequest,
  ) {
    return this.monitoringService.getMonitoringStats(
      getMonitoringStatsDto,
      req.user,
    );
  }

  @Get('last-month')
  @ApiOperation({
    summary:
      'Get monitoring metrics for last month for each site with a spotter',
  })
  @Auth(AdminLevel.SuperAdmin)
  getMonitoringLastMonth() {
    return this.monitoringService.getMonitoringLastMonth();
  }

  @Get('surveys-report')
  @ApiOperation({ summary: 'Get surveys report' })
  @Auth(AdminLevel.SuperAdmin)
  getSurveysReport() {
    return this.monitoringService.surveysReport();
  }

  @Get('application-overview')
  @ApiOperation({ summary: 'Get Aqualink overview' })
  @Auth(AdminLevel.SuperAdmin)
  getSitesOverview(@Query() getSitesOverviewDto: GetMonitoringStatsDto) {
    return this.monitoringService.SitesOverview(getSitesOverviewDto);
  }
}
