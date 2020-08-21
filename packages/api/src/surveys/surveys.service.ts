import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Survey } from './surveys.entity';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { User } from '../users/users.entity';
import { CreateSurveyMediaDto } from './dto/create-survey-media.dto';
import { SurveyMedia } from './survey-media.entity';
import { Reef } from '../reefs/reefs.entity';
import { DailyData } from '../reefs/daily-data.entity';

@Injectable()
export class SurveysService {
  constructor(
    @InjectRepository(Survey)
    private surveyRepository: Repository<Survey>,

    @InjectRepository(SurveyMedia)
    private surveyMediaRepository: Repository<SurveyMedia>,

    @InjectRepository(Reef)
    private reefRepository: Repository<Reef>,
  ) {}

  async create(createSurveyDto: CreateSurveyDto, user: User): Promise<Survey> {
    const survey = await this.surveyRepository.save({
      userId: user,
      ...createSurveyDto,
    });

    // eslint-disable-next-line fp/no-delete
    delete survey.userId;
    return survey;
  }

  async createMedia(
    createSurveyMediaDto: CreateSurveyMediaDto,
    surveyId: number,
  ): Promise<SurveyMedia> {
    const survey = await this.surveyRepository.findOne(surveyId);
    if (!survey) {
      throw new NotFoundException(`Survey with id ${surveyId} was not found`);
    }

    return this.surveyMediaRepository.save({
      survey,
      ...createSurveyMediaDto,
    });
  }

  async find(reefId: number): Promise<Survey[]> {
    const surveyHistoryQuery = await this.surveyRepository
      .createQueryBuilder('survey')
      .leftJoinAndMapOne(
        'survey.latestDailyData',
        'daily_data',
        'data',
        'data.reef_id = survey.reef_id AND DATE(data.date) = DATE(survey.diveDate)',
      )
      .where('survey.reef_id = :reefId', { reefId })
      .getMany();

    return surveyHistoryQuery.map((survey) => {
      const surveyDailyData = survey.latestDailyData;
      return {
        diveDate: survey.diveDate,
        comments: survey.comments,
        weatherConditions: survey.weatherConditions,
        temperature:
          survey.temperature ||
          (surveyDailyData && surveyDailyData.avgBottomTemperature),
      };
    });
  }
}
