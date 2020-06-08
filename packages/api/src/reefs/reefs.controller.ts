import { merge } from 'lodash';
import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { ReefDto } from './interfaces/reefs.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ReefRepository } from './reefs.repository';
import reefs from '../../mock_response/reefs.json'
import reefDetails from '../../mock_response/reefs_id.json'
import dailyData from '../../mock_response/daily_data.json'
import surveys from '../../mock_response/survey_data.json'

@Controller('reefs')
export class ReefsController {
  constructor(
      @InjectRepository(ReefRepository) private readonly reefRepository: ReefRepository,
      ) {}
      
      @Post()
      create(@Body() reefDto: ReefDto) {
      return this.reefRepository.createReef(reefDto);
      }

  @Get()
  findAll() {
    // return this.reefRepository.find();
    return reefs;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return merge(reefDetails, { "id": id });
    // return this.reefRepository.findOneReef(id);
  }

  @Get(':id/daily_data')
  findDailyData(@Param('id') id: string) {
    return dailyData;
    // return this.reefRepository.findOneReef(id);
  }

  @Get(':id/surveys/:poi')
  findSurveys(@Param('id') id: string, @Param('poi') poi: string) {
    const filteredSurvey = surveys.map(
      (survey) => {
        const images = survey.images.filter(image => image.poi_label_id == parseInt(poi))
        survey.images = images
        return survey
      }
    )
    return filteredSurvey;
    // return this.reefRepository.findOneReef(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() reefDto: ReefDto) {
    return this.reefRepository.updateReef(id, reefDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reefRepository.removeReef(id);
  }
}
