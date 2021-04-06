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
import { ReefPoisService } from './reef-pois.service';
import { ReefPointOfInterest } from './reef-pois.entity';
import { CreateReefPoiDto } from './dto/create-reef-poi.dto';
import { FilterReefPoiDto } from './dto/filter-reef-poi.dto';
import { UpdateReefPoiDto } from './dto/update-reef-poi.dto';
import { AdminLevel } from '../users/users.entity';
import { Auth } from '../auth/auth.decorator';
import { Public } from '../auth/public.decorator';
import { CustomApiNotFoundResponse } from '../docs/api-response';

@ApiTags('Reef Points of Interest')
@Auth(AdminLevel.ReefManager, AdminLevel.SuperAdmin)
@Controller('pois')
export class ReefPoisController {
  constructor(private poisService: ReefPoisService) {}

  @ApiBearerAuth()
  @Post()
  create(
    @Body() createReefPoiDto: CreateReefPoiDto,
  ): Promise<ReefPointOfInterest> {
    return this.poisService.create(createReefPoiDto);
  }

  @Public()
  @Get()
  find(
    @Query() filterReefPoiDto: FilterReefPoiDto,
  ): Promise<ReefPointOfInterest[]> {
    return this.poisService.find(filterReefPoiDto);
  }

  @CustomApiNotFoundResponse(
    'No reef point of interest was found with the specified id',
  )
  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ReefPointOfInterest> {
    return this.poisService.findOne(id);
  }

  @ApiBearerAuth()
  @CustomApiNotFoundResponse(
    'No reef point of interest was found with the specified id',
  )
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReefPoiDto: UpdateReefPoiDto,
  ): Promise<ReefPointOfInterest> {
    return this.poisService.update(id, updateReefPoiDto);
  }

  @ApiBearerAuth()
  @CustomApiNotFoundResponse(
    'No reef point of interest was found with the specified id',
  )
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.poisService.delete(id);
  }
}
