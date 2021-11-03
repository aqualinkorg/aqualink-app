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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { RegionsService } from './regions.service';
import { Region } from './regions.entity';
import { CreateRegionDto } from './dto/create-region.dto';
import { FilterRegionDto } from './dto/filter-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { Auth } from '../auth/auth.decorator';
import { AdminLevel } from '../users/users.entity';
import { Public } from '../auth/public.decorator';
import { ApiNestNotFoundResponse } from '../docs/api-response';

@ApiTags('Regions')
@Auth(AdminLevel.SiteManager, AdminLevel.SuperAdmin)
@Controller('regions')
export class RegionsController {
  constructor(private regionsService: RegionsService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Creates new region' })
  @Post()
  create(@Body() createRegionDto: CreateRegionDto): Promise<Region> {
    return this.regionsService.create(createRegionDto);
  }

  @ApiOperation({ summary: 'Returns regions filtered by provided filters' })
  @Public()
  @Get()
  find(@Query() filterRegionDto: FilterRegionDto): Promise<Region[]> {
    return this.regionsService.find(filterRegionDto);
  }

  @ApiNestNotFoundResponse('No region was found with the specified id')
  @ApiOperation({ summary: 'Returns specified region' })
  @ApiParam({ name: 'id', example: 1 })
  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Region> {
    return this.regionsService.findOne(id);
  }

  @ApiBearerAuth()
  @ApiNestNotFoundResponse('No region was found with the specified id')
  @ApiOperation({ summary: 'Updates specified region' })
  @ApiParam({ name: 'id', example: 1 })
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRegionDto: UpdateRegionDto,
  ): Promise<Region> {
    return this.regionsService.update(id, updateRegionDto);
  }

  @ApiBearerAuth()
  @ApiNestNotFoundResponse('No region was found with the specified id')
  @ApiOperation({ summary: 'Deletes specified region' })
  @ApiParam({ name: 'id', example: 1 })
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.regionsService.delete(id);
  }
}
