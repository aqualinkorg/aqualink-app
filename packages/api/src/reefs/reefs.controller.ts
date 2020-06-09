import { merge } from 'lodash';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reef } from './reefs.entity';
import reefs from '../../mock_response/reefs.json';
import reefDetails from '../../mock_response/reefs_id.json';
import dailyData from '../../mock_response/daily_data.json';
import surveys from '../../mock_response/survey_data.json';

@Controller('reefs')
export class ReefsController {
  constructor(
    @InjectRepository(Reef)
    private readonly reefRepository: Repository<Reef>,
  ) {}

  @Post()
  create(@Body() reefData: Reef) {
    return this.reefRepository.insert(reefData);
  }

  @Get()
  findAll() {
    // return this.reefRepository.find();
    return reefs;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return merge(reefDetails, { id });
    // return this.reefRepository.findOneReef(id);
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
  update(@Param('id') id: string, @Body() reef: Reef) {
    return this.reefRepository.save({ ...reef, id: parseInt(id, 10) });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reefRepository.delete(id);
  }
}
