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
} from '@nestjs/common';
import { ReefsService } from './reefs.service';
import { Reef } from './reefs.entity';
import { FilterReefDto } from './dto/filter-reef.dto';
import { UpdateReefDto } from './dto/update-reef.dto';
import { AdminLevel } from '../users/users.entity';
import { Auth } from '../auth/auth.decorator';
import { Public } from '../auth/public.decorator';
import { CreateReefDto } from './dto/create-reef.dto';
import { IsReefAdminGuard } from '../auth/is-reef-admin.guard';
import { ParseDatePipe } from '../pipes/parse-date.pipe';

@Auth(AdminLevel.ReefManager, AdminLevel.SuperAdmin)
@Controller('reefs')
export class ReefsController {
  constructor(private reefsService: ReefsService) {}

  @Post()
  create(@Body() createReefDto: CreateReefDto): Promise<Reef> {
    return this.reefsService.create(createReefDto);
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
  findDailyData(@Param('id') id: number) {
    return this.reefsService.findDailyData(id);
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
}
