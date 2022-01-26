import {
  Controller,
  Body,
  Param,
  Post,
  Get,
  Put,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { SitesService } from './sites.service';
import { Site } from './sites.entity';
import { FilterSiteDto } from './dto/filter-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { AdminLevel } from '../users/users.entity';
import { Auth } from '../auth/auth.decorator';
import { Public } from '../auth/public.decorator';
import { CreateSiteApplicationDto, CreateSiteDto } from './dto/create-site.dto';
import { IsSiteAdminGuard } from '../auth/is-site-admin.guard';
import { ParseDatePipe } from '../pipes/parse-date.pipe';
import { DeploySpotterDto } from './dto/deploy-spotter.dto';
import { ExcludeSpotterDatesDto } from './dto/exclude-spotter-dates.dto';
import { ExclusionDates } from './exclusion-dates.entity';
import { SiteApplication } from '../site-applications/site-applications.entity';
import { AuthRequest } from '../auth/auth.types';
import { OverrideLevelAccess } from '../auth/override-level-access.decorator';
import { ApiCreateSiteBody } from '../docs/api-properties';
import { SpotterDataDto } from './dto/spotter-data.dto';
import {
  ApiNestBadRequestResponse,
  ApiNestNotFoundResponse,
} from '../docs/api-response';
import { SofarLiveDataDto } from './dto/live-data.dto';

@ApiTags('Sites')
@Auth(AdminLevel.SiteManager, AdminLevel.SuperAdmin)
@Controller('sites')
export class SitesController {
  constructor(private sitesService: SitesService) {}

  @ApiBearerAuth()
  @ApiCreateSiteBody()
  @ApiOperation({ summary: 'Creates a new site and its site application' })
  @OverrideLevelAccess()
  @Post()
  create(
    @Req() request: AuthRequest,
    @Body('siteApplication') siteApplication: CreateSiteApplicationDto,
    @Body('site') site: CreateSiteDto,
  ): Promise<SiteApplication> {
    return this.sitesService.create(siteApplication, site, request.user);
  }

  @ApiOperation({ summary: 'Returns sites filtered by provided filters' })
  @Public()
  @Get()
  find(@Query() filterSiteDto: FilterSiteDto): Promise<Site[]> {
    return this.sitesService.find(filterSiteDto);
  }

  @ApiNestNotFoundResponse('No site was found with the specified id')
  @ApiOperation({ summary: 'Returns specified site' })
  @ApiParam({ name: 'id', example: 1 })
  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Site> {
    return this.sitesService.findOne(id);
  }

  @ApiNestNotFoundResponse('No site was found with the specified id')
  @ApiNestBadRequestResponse('Start or end is not a valid date')
  @ApiOperation({ summary: 'Returns daily data of the specified site' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiQuery({ name: 'start', example: '2021-04-18T08:45:35.780Z' })
  @ApiQuery({ name: 'end', example: '2021-05-18T08:45:35.780Z' })
  @Public()
  @Get(':id/daily_data')
  findDailyData(
    @Param('id', ParseIntPipe) id: number,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    return this.sitesService.findDailyData(id, start, end);
  }

  @ApiNestNotFoundResponse('No site was found with the specified id')
  @ApiOperation({ summary: 'Returns live data of the specified site' })
  @ApiParam({ name: 'id', example: 1 })
  @Public()
  @Get(':id/live_data')
  findLiveData(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SofarLiveDataDto> {
    return this.sitesService.findLiveData(id);
  }

  @ApiNestNotFoundResponse('No site was found or found site had no spotter')
  @ApiOperation({ summary: 'Returns spotter data of the specified site' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiQuery({ name: 'startDate', example: '2021-04-18T08:45:35.780Z' })
  @ApiQuery({ name: 'endDate', example: '2021-05-18T08:45:35.780Z' })
  @Public()
  @Get(':id/spotter_data')
  getSpotterData(
    @Param('id', ParseIntPipe) id: number,
    @Query('startDate', ParseDatePipe) startDate?: string,
    @Query('endDate', ParseDatePipe) endDate?: string,
  ): Promise<SpotterDataDto> {
    return this.sitesService.getSpotterData(id, startDate, endDate);
  }

  @ApiBearerAuth()
  @ApiNestNotFoundResponse('No site was found with the specified id')
  @ApiOperation({ summary: 'Updates specified site' })
  @ApiParam({ name: 'siteId', example: 1 })
  @UseGuards(IsSiteAdminGuard)
  @Put(':siteId')
  update(
    @Param('siteId', ParseIntPipe) id: number,
    @Body() updateSiteDto: UpdateSiteDto,
  ): Promise<Site> {
    return this.sitesService.update(id, updateSiteDto);
  }

  @ApiBearerAuth()
  @ApiNestNotFoundResponse('No site was found with the specified id')
  @ApiOperation({ summary: 'Deletes specified site' })
  @ApiParam({ name: 'siteId', example: 1 })
  @UseGuards(IsSiteAdminGuard)
  @Delete(':siteId')
  delete(@Param('siteId', ParseIntPipe) id: number): Promise<void> {
    return this.sitesService.delete(id);
  }

  @ApiBearerAuth()
  @ApiNestNotFoundResponse('No site was found with the specified id')
  @ApiNestBadRequestResponse(
    'Site has no spotter or spotter is already deployed',
  )
  @ApiOperation({ summary: "Deploys site's spotter" })
  @ApiParam({ name: 'siteId', example: 1 })
  @UseGuards(IsSiteAdminGuard)
  @Post(':siteId/deploy')
  deploySpotter(
    @Param('siteId', ParseIntPipe) id: number,
    @Body() deploySpotterDto: DeploySpotterDto,
  ): Promise<void> {
    return this.sitesService.deploySpotter(id, deploySpotterDto);
  }

  @ApiBearerAuth()
  @ApiNestNotFoundResponse('No site was found with the specified id')
  @ApiNestBadRequestResponse(
    'Site has no spotter or start date is larger than end date',
  )
  @ApiOperation({ summary: "Adds exclusion dates to spotter's data" })
  @ApiParam({ name: 'siteId', example: 1 })
  @UseGuards(IsSiteAdminGuard)
  @Post(':siteId/exclusion_dates')
  addExclusionDates(
    @Param('siteId', ParseIntPipe) id: number,
    @Body() excludeSpotterDatesDto: ExcludeSpotterDatesDto,
  ): Promise<void> {
    return this.sitesService.addExclusionDates(id, excludeSpotterDatesDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: "Returns exclusion dates of specified site's spotter",
  })
  @ApiParam({ name: 'siteId', example: 1 })
  @UseGuards(IsSiteAdminGuard)
  @Get(':siteId/exclusion_dates')
  findExclusionDates(
    @Param('siteId', ParseIntPipe) id: number,
  ): Promise<ExclusionDates[]> {
    return this.sitesService.getExclusionDates(id);
  }
}
