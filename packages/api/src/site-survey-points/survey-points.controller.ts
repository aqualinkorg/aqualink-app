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
import { SiteSurveyPointsService } from './site-survey-points.service';
import { SiteSurveyPoint } from './site-survey-points.entity';
import { CreateSitePoiDto } from './dto/create-survey-point.dto';
import { FilterSitePoiDto } from './dto/filter-survey-point.dto';
import { UpdateSitePoiDto } from './dto/update-survey-point.dto';
import { AdminLevel } from '../users/users.entity';
import { Auth } from '../auth/auth.decorator';
import { Public } from '../auth/public.decorator';
import { ApiNestNotFoundResponse } from '../docs/api-response';

@ApiTags('Site Points of Interest')
@Auth(AdminLevel.SiteManager, AdminLevel.SuperAdmin)
@Controller('surveyPoints')
export class SiteSurveyPointsController {
  constructor(private surveyPointsService: SiteSurveyPointsService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Creates a new site point of interest' })
  @Post()
  create(@Body() createSitePoiDto: CreateSitePoiDto): Promise<SiteSurveyPoint> {
    return this.surveyPointsService.create(createSitePoiDto);
  }

  @ApiOperation({
    summary: 'Returns site points of interest filtered by the provided filters',
  })
  @Public()
  @Get()
  find(
    @Query() filterSitePoiDto: FilterSitePoiDto,
  ): Promise<SiteSurveyPoint[]> {
    return this.surveyPointsService.find(filterSitePoiDto);
  }

  @ApiNestNotFoundResponse(
    'No site point of interest was found with the specified id',
  )
  @ApiOperation({
    summary: 'Returns specified site point of interest',
  })
  @ApiParam({ name: 'id', example: 1 })
  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<SiteSurveyPoint> {
    return this.surveyPointsService.findOne(id);
  }

  @ApiBearerAuth()
  @ApiNestNotFoundResponse(
    'No site point of interest was found with the specified id',
  )
  @ApiOperation({ summary: 'Updates specified site point of interest' })
  @ApiParam({ name: 'id', example: 1 })
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSitePoiDto: UpdateSitePoiDto,
  ): Promise<SiteSurveyPoint> {
    return this.surveyPointsService.update(id, updateSitePoiDto);
  }

  @ApiBearerAuth()
  @ApiNestNotFoundResponse(
    'No site point of interest was found with the specified id',
  )
  @ApiOperation({ summary: 'Deletes specified site point of interest' })
  @ApiParam({ name: 'id', example: 1 })
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.surveyPointsService.delete(id);
  }
}
