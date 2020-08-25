import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Survey } from './surveys.entity';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { User } from '../users/users.entity';
import { CreateSurveyMediaDto } from './dto/create-survey-media.dto';
import { SurveyMedia, MediaType } from './survey-media.entity';
import { ReefPointOfInterest } from '../reef-pois/reef-pois.entity';
import { EditSurveyDto } from './dto/edit-survey.dto';
import { EditSurveyMediaDto } from './dto/edit-survey-media.dto';

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

  // Create a survey
  async create(createSurveyDto: CreateSurveyDto, user: User): Promise<Survey> {
    const survey = await this.surveyRepository.save({
      userId: user,
      ...createSurveyDto,
    });

    // eslint-disable-next-line fp/no-delete
    delete survey.userId;
    return survey;
  }

  // Create a survey media (video or image)
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

  // Find all surveys related to a specific reef.
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
        // If no logged temperature exists grab the latest daily temperature of the survey's date
        temperature:
          survey.temperature ||
          (surveyDailyData && surveyDailyData.avgBottomTemperature),
      };
    });
  }

  // Find one survey provided its id
  // Include its surveyMedia grouped by reefPointOfInterest
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

  async update(
    editSurveyDto: EditSurveyDto,
    surveyId: number,
  ): Promise<Survey> {
    const result = await this.surveyRepository.update(surveyId, editSurveyDto);

    if (!result.affected) {
      throw new NotFoundException(`Survey with id ${surveyId} was not found`);
    }
    const updated = await this.surveyRepository.findOne(surveyId);

    if (!updated) {
      throw new InternalServerErrorException('Something went wrong');
    }

    return updated;
  }

  async updateMedia(
    editSurveyMediaDto: EditSurveyMediaDto,
    mediaId: number,
  ): Promise<SurveyMedia> {
    const result = await this.surveyMediaRepository.update(
      mediaId,
      editSurveyMediaDto,
    );

    if (!result.affected) {
      throw new NotFoundException(
        `Survey media with id ${mediaId} was not found`,
      );
    }
    const updated = await this.surveyMediaRepository.findOne(mediaId);

    if (!updated) {
      throw new InternalServerErrorException('Something went wrong');
    }

    return updated;
  }

  async delete(surveyId: number): Promise<void> {
    const result = await this.surveyRepository.delete(surveyId);

    if (!result.affected) {
      throw new NotFoundException(`Survey with id ${surveyId} was not found`);
    }
  }

  async deleteMedia(mediaId: number): Promise<void> {
    const result = await this.surveyMediaRepository.delete(mediaId);

    if (!result.affected) {
      throw new NotFoundException(
        `Survey media with id ${mediaId} was not found`,
      );
    }
  }
}
