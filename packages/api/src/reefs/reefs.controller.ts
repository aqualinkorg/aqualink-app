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

@Auth(AdminLevel.ReefManager, AdminLevel.SuperAdmin)
@Controller('reefs')
export class ReefsController {
  constructor(private reefsService: ReefsService) {}

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

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Reef> {
    return this.reefsService.findOne(id);
  }

  @Public()
  @Get(':id/daily_data')
  findDailyData(
    @Param('id', ParseIntPipe) id: number,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    return this.reefsService.findDailyData(id, start, end);
  }

  @Public()
  @Get(':id/live_data')
  findLiveData(@Param('id') id: number) {
    return this.reefsService.findLiveData(id);
  }

  @Public()
  @Get(':id/spotter_data')
  getSpotterData(
    @Param('id', ParseIntPipe) id: number,
    @Query('startDate', ParseDatePipe) startDate: Date,
    @Query('endDate', ParseDatePipe) endDate: Date,
  ) {
    return this.reefsService.getSpotterData(id, startDate, endDate);
  }

  @UseGuards(IsReefAdminGuard)
  @Put(':reef_id')
  update(
    @Param('reef_id', ParseIntPipe) id: number,
    @Body() updateReefDto: UpdateReefDto,
  ): Promise<Reef> {
    return this.reefsService.update(id, updateReefDto);
  }

  @UseGuards(IsReefAdminGuard)
  @Delete(':reef_id')
  delete(@Param('reef_id', ParseIntPipe) id: number): Promise<void> {
    return this.reefsService.delete(id);
  }

  @UseGuards(IsReefAdminGuard)
  @Post(':reef_id/deploy')
  deploySpotter(
    @Param('reef_id', ParseIntPipe) id: number,
    @Body() deploySpotterDto: DeploySpotterDto,
  ): Promise<void> {
    return this.reefsService.deploySpotter(id, deploySpotterDto);
  }

  @UseGuards(IsReefAdminGuard)
  @Post(':reef_id/exclusion_dates')
  addExclusionDates(
    @Param('reef_id', ParseIntPipe) id: number,
    @Body() excludeSpotterDatesDto: ExcludeSpotterDatesDto,
  ): Promise<void> {
    return this.reefsService.addExclusionDates(id, excludeSpotterDatesDto);
  }

  @UseGuards(IsReefAdminGuard)
  @Get(':reef_id/exclusion_dates')
  findExclusionDates(
    @Param('reef_id', ParseIntPipe) id: number,
  ): Promise<ExclusionDates[]> {
    return this.reefsService.getExclusionDates(id);
  }
}
