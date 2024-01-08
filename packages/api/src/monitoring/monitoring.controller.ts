import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from 'auth/auth.decorator';
import { AuthRequest } from 'auth/auth.types';
import { AdminLevel } from 'users/users.entity';
import type { Response } from 'express';
import { GetMonitoringStatsDto } from './dto/get-monitoring-stats.dto';
import { GetSitesOverviewDto } from './dto/get-sites-overview.dto';
import { PostMonitoringMetricDto } from './dto/post-monitoring-metric.dto';
import { MonitoringService } from './monitoring.service';
import { GetMonitoringLastMonthDto } from './dto/get-monitoring-last-month.dto';

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
    @Res() res: Response,
  ) {
    return this.monitoringService.getMonitoringStats(
      getMonitoringStatsDto,
      req.user,
      res,
    );
  }

  @Get('last-month')
  @ApiOperation({
    summary:
      'Get monitoring metrics for last month for each site with a spotter',
  })
  @Auth(AdminLevel.SuperAdmin)
  getMonitoringLastMonth(
    @Query() getMonitoringLastMonthDto: GetMonitoringLastMonthDto,
    @Res() res: Response,
  ) {
    return this.monitoringService.getMonitoringLastMonth(
      getMonitoringLastMonthDto,
      res,
    );
  }

  @Get('surveys-report')
  @ApiOperation({ summary: 'Get surveys report' })
  @Auth(AdminLevel.SuperAdmin)
  getSurveysReport() {
    return this.monitoringService.surveysReport();
  }

  @Get('sites-overview')
  @ApiOperation({ summary: 'Get Aqualink overview' })
  @Auth(AdminLevel.SuperAdmin)
  getSitesOverview(@Query() getSitesOverviewDto: GetSitesOverviewDto) {
    return this.monitoringService.SitesOverview(getSitesOverviewDto);
  }

  @Get('sites-status')
  @ApiOperation({ summary: "Get sites' status" })
  @Auth(AdminLevel.SuperAdmin)
  getSitesStatus() {
    return this.monitoringService.getSitesStatus();
  }
}
