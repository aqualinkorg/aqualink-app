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
import { ReefPoisService } from './reef-pois.service';
import { ReefPointOfInterest } from './reef-pois.entity';
import { CreateReefPoiDto } from './dto/create-reef-poi.dto';
import { FilterReefPoiDto } from './dto/filter-reef-poi.dto';
import { UpdateReefPoiDto } from './dto/update-reef-poi.dto';
import { AdminLevel } from '../users/users.entity';
import { Auth } from '../auth/auth.decorator';
import { Public } from '../auth/public.decorator';
import { ApiNestNotFoundResponse } from '../docs/api-response';

@ApiTags('Reef Points of Interest')
@Auth(AdminLevel.ReefManager, AdminLevel.SuperAdmin)
@Controller('pois')
export class ReefPoisController {
  constructor(private poisService: ReefPoisService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Creates a new reef point of interest' })
  @Post()
  create(
    @Body() createReefPoiDto: CreateReefPoiDto,
  ): Promise<ReefPointOfInterest> {
    return this.poisService.create(createReefPoiDto);
  }

  @ApiOperation({
    summary: 'Returns reef points of interest filtered by the provided filters',
  })
  @Public()
  @Get()
  find(
    @Query() filterReefPoiDto: FilterReefPoiDto,
  ): Promise<ReefPointOfInterest[]> {
    return this.poisService.find(filterReefPoiDto);
  }

  @ApiNestNotFoundResponse(
    'No reef point of interest was found with the specified id',
  )
  @ApiOperation({
    summary: 'Returns specified reef point of interest',
  })
  @ApiParam({ name: 'id', example: 1 })
  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ReefPointOfInterest> {
    return this.poisService.findOne(id);
  }

  @ApiBearerAuth()
  @ApiNestNotFoundResponse(
    'No reef point of interest was found with the specified id',
  )
  @ApiOperation({ summary: 'Updates specified reef point of interest' })
  @ApiParam({ name: 'id', example: 1 })
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReefPoiDto: UpdateReefPoiDto,
  ): Promise<ReefPointOfInterest> {
    return this.poisService.update(id, updateReefPoiDto);
  }

  @ApiBearerAuth()
  @ApiNestNotFoundResponse(
    'No reef point of interest was found with the specified id',
  )
  @ApiOperation({ summary: 'Deletes specified reef point of interest' })
  @ApiParam({ name: 'id', example: 1 })
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.poisService.delete(id);
  }
}
