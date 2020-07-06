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
import { ReefsService } from './reefs.service';
import { Reef } from './reefs.entity';
import { CreateReefDto } from './dto/create-reef.dto';
import { FilterReefDto } from './dto/filter-reef.dto';
import { UpdateReefDto } from './dto/update-reef.dto';
import dailyData from '../../mock_response/daily_data.json';
import surveys from '../../mock_response/survey_data.json';

@Controller('reefs')
export class ReefsController {
  constructor(private reefsService: ReefsService) {}

  @Post()
  create(@Body() createReefDto: CreateReefDto): Promise<Reef> {
    return this.reefsService.create(createReefDto);
  }

  @Get()
  find(@Query() filterReefDto: FilterReefDto): Promise<Reef[]> {
    return this.reefsService.find(filterReefDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Reef> {
    return this.reefsService.findOne(id);
  }

  @Get(':id/daily_data')
  // eslint-disable-next-line no-unused-vars
  findDailyData(@Param('id') id: string) {
    return dailyData;
    // return this.reefRepository.findOneReef(id);
  }

  @Get(':id/surveys/:poi')
  findSurveys(@Param('id') id: string, @Param('poi') poi: string) {
    return surveys.map((survey) => ({
      ...survey,
      images: survey.images.filter(
        (image) => image.poi_label_id === parseInt(poi, 10),
      ),
    }));
    // return this.reefRepository.findOneReef(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReefDto: UpdateReefDto,
  ): Promise<Reef> {
    return this.reefsService.update(id, updateReefDto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.reefsService.delete(id);
  }
}
