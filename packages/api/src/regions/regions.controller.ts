import {
  Controller,
  Body,
  Param,
  Get,
  Post,
  Put,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RegionsService } from './regions.service';
import { Region } from './regions.entity';
import { CreateRegionDto } from './dto/create-region.dto';
import { FilterRegionDto } from './dto/filter-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { Auth } from '../auth/auth.decorator';
import { AdminLevel } from '../users/users.entity';
import { Public } from '../auth/public.decorator';
import { CustomApiNotFoundResponse } from '../docs/api-properties';

@ApiTags('Regions')
@Auth(AdminLevel.ReefManager, AdminLevel.SuperAdmin)
@Controller('regions')
export class RegionsController {
  constructor(private regionsService: RegionsService) {}

  @ApiBearerAuth()
  @Post()
  create(@Body() createRegionDto: CreateRegionDto): Promise<Region> {
    return this.regionsService.create(createRegionDto);
  }

  @Public()
  @Get()
  find(@Query() filterRegionDto: FilterRegionDto): Promise<Region[]> {
    return this.regionsService.find(filterRegionDto);
  }

  @CustomApiNotFoundResponse('No region was found with the specified id')
  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Region> {
    return this.regionsService.findOne(id);
  }

  @ApiBearerAuth()
  @CustomApiNotFoundResponse('No region was found with the specified id')
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRegionDto: UpdateRegionDto,
  ): Promise<Region> {
    return this.regionsService.update(id, updateRegionDto);
  }

  @ApiBearerAuth()
  @CustomApiNotFoundResponse('No region was found with the specified id')
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.regionsService.delete(id);
  }
}
