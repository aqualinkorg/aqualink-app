import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Survey } from './surveys.entity';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { User } from '../users/users.entity';
import { CreateSurveyMediaDto } from './dto/create-survey-media.dto';
import { SurveyMedia, MediaType } from './survey-media.entity';
import { ReefPointOfInterest } from '../reef-pois/reef-pois.entity';

@Injectable()
export class SurveysService {
  constructor(
    @InjectRepository(Survey)
    private surveyRepository: Repository<Survey>,

    @InjectRepository(SurveyMedia)
    private surveyMediaRepository: Repository<SurveyMedia>,

    @InjectRepository(ReefPointOfInterest)
    private poiRepository: Repository<ReefPointOfInterest>,
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
      surveyId: survey,
      type: MediaType.Image,
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
        id: survey.id,
        diveDate: survey.diveDate,
        comments: survey.comments,
        weatherConditions: survey.weatherConditions,
        temperature:
          survey.temperature ||
          (surveyDailyData && surveyDailyData.avgBottomTemperature),
      };
    });
  }

  async findOne(surveyId: number): Promise<Survey> {
    const survey = await this.surveyRepository.findOne(surveyId);
    const reefPointsOfInterest = await this.poiRepository
      .createQueryBuilder('poi')
      .leftJoinAndSelect('poi.surveyMedia', 'surveyMedia')
      .where('surveyMedia.surveyId = :surveyId', { surveyId })
      .select([
        'surveyMedia.url',
        'surveyMedia.id',
        'surveyMedia.featured',
        'surveyMedia.type',
        'surveyMedia.observations',
        'surveyMedia.comments',
      ])
      .addSelect(['poi.id', 'poi.imageUrl', 'poi.name'])
      .getMany();

    if (!survey) {
      throw new NotFoundException(`Survey with id ${surveyId} was not found`);
    }

    const returnValue: Survey = {
      surveyPoints: reefPointsOfInterest,
      ...survey,
    };

    return returnValue;
  }
}
