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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReefsService } from './reefs.service';
import { Reef } from './reefs.entity';
import { FilterReefDto } from './dto/filter-reef.dto';
import { UpdateReefDto } from './dto/update-reef.dto';
import { AdminLevel } from '../users/users.entity';
import { Auth } from '../auth/auth.decorator';
import { Public } from '../auth/public.decorator';
import { CreateReefApplicationDto, CreateReefDto } from './dto/create-reef.dto';
import { IsReefAdminGuard } from '../auth/is-reef-admin.guard';
import { ParseDatePipe } from '../pipes/parse-date.pipe';
import { DeploySpotterDto } from './dto/deploy-spotter.dto';
import { ExcludeSpotterDatesDto } from './dto/exclude-spotter-dates.dto';
import { ExclusionDates } from './exclusion-dates.entity';
import { ReefApplication } from '../reef-applications/reef-applications.entity';
import { AuthRequest } from '../auth/auth.types';
import { OverrideLevelAccess } from '../auth/override-level-access.decorator';
import { ApiCreateReefBody } from '../docs/api-properties';
import { SpotterDataDto } from './dto/spotter-data.dto';
import {
  ApiNestBadRequestResponse,
  ApiNestNotFoundResponse,
} from '../docs/api-response';
import { SofarLiveDataDto } from './dto/live-data.dto';

@ApiTags('Reefs')
@Auth(AdminLevel.ReefManager, AdminLevel.SuperAdmin)
@Controller('reefs')
export class ReefsController {
  constructor(private reefsService: ReefsService) {}

  @ApiBearerAuth()
  @ApiCreateReefBody()
  @OverrideLevelAccess()
  @Post()
  create(
    @Req() request: AuthRequest,
    @Body('reefApplication') reefApplication: CreateReefApplicationDto,
    @Body('reef') reef: CreateReefDto,
  ): Promise<ReefApplication> {
    return this.reefsService.create(reefApplication, reef, request.user);
  }

  @Public()
  @Get()
  find(@Query() filterReefDto: FilterReefDto): Promise<Reef[]> {
    return this.reefsService.find(filterReefDto);
  }

  @ApiNestNotFoundResponse('No reef was found with the specified id')
  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Reef> {
    return this.reefsService.findOne(id);
  }

  @ApiNestNotFoundResponse('No reef was found with the specified id')
  @ApiNestBadRequestResponse('Start or end is not a valid date')
  @Public()
  @Get(':id/daily_data')
  findDailyData(
    @Param('id', ParseIntPipe) id: number,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    return this.reefsService.findDailyData(id, start, end);
  }

  @ApiNestNotFoundResponse('No reef was found with the specified id')
  @Public()
  @Get(':id/live_data')
  findLiveData(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SofarLiveDataDto> {
    return this.reefsService.findLiveData(id);
  }

  @ApiNestNotFoundResponse('No reef was found or found reef had no spotter')
  @Public()
  @Get(':id/spotter_data')
  getSpotterData(
    @Param('id', ParseIntPipe) id: number,
    @Query('startDate', ParseDatePipe) startDate: Date,
    @Query('endDate', ParseDatePipe) endDate: Date,
  ): Promise<SpotterDataDto> {
    return this.reefsService.getSpotterData(id, startDate, endDate);
  }

  @ApiBearerAuth()
  @ApiNestNotFoundResponse('No reef was found with the specified id')
  @UseGuards(IsReefAdminGuard)
  @Put(':reef_id')
  update(
    @Param('reef_id', ParseIntPipe) id: number,
    @Body() updateReefDto: UpdateReefDto,
  ): Promise<Reef> {
    return this.reefsService.update(id, updateReefDto);
  }

  @ApiBearerAuth()
  @ApiNestNotFoundResponse('No reef was found with the specified id')
  @UseGuards(IsReefAdminGuard)
  @Delete(':reef_id')
  delete(@Param('reef_id', ParseIntPipe) id: number): Promise<void> {
    return this.reefsService.delete(id);
  }

  @ApiBearerAuth()
  @ApiNestNotFoundResponse('No reef was found with the specified id')
  @ApiNestBadRequestResponse(
    'Reef has no spotter or spotter is already deployed',
  )
  @UseGuards(IsReefAdminGuard)
  @Post(':reef_id/deploy')
  deploySpotter(
    @Param('reef_id', ParseIntPipe) id: number,
    @Body() deploySpotterDto: DeploySpotterDto,
  ): Promise<void> {
    return this.reefsService.deploySpotter(id, deploySpotterDto);
  }

  @ApiBearerAuth()
  @ApiNestNotFoundResponse('No reef was found with the specified id')
  @ApiNestBadRequestResponse(
    'Reef has no spotter or start date is larger than end date',
  )
  @UseGuards(IsReefAdminGuard)
  @Post(':reef_id/exclusion_dates')
  addExclusionDates(
    @Param('reef_id', ParseIntPipe) id: number,
    @Body() excludeSpotterDatesDto: ExcludeSpotterDatesDto,
  ): Promise<void> {
    return this.reefsService.addExclusionDates(id, excludeSpotterDatesDto);
  }

  @ApiBearerAuth()
  @UseGuards(IsReefAdminGuard)
  @Get(':reef_id/exclusion_dates')
  findExclusionDates(
    @Param('reef_id', ParseIntPipe) id: number,
  ): Promise<ExclusionDates[]> {
    return this.reefsService.getExclusionDates(id);
  }
}
