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
import { GoogleCloudService } from '../google-cloud/google-cloud.service';

@Injectable()
export class SurveysService {
  constructor(
    @InjectRepository(Survey)
    private surveyRepository: Repository<Survey>,

    @InjectRepository(SurveyMedia)
    private surveyMediaRepository: Repository<SurveyMedia>,

    @InjectRepository(ReefPointOfInterest)
    private poiRepository: Repository<ReefPointOfInterest>,

    private googleCloudService: GoogleCloudService,
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

    // Check if a featured media already exists for this survey
    const featuredMedia = await this.surveyMediaRepository.findOne({
      where: {
        featured: true,
        surveyId: survey,
      },
    });

    const newFeatured =
      featuredMedia &&
      createSurveyMediaDto.featured &&
      !createSurveyMediaDto.hidden;

    if (featuredMedia && newFeatured) {
      await this.surveyMediaRepository.update(featuredMedia.id, {
        featured: false,
      });
    }

    return this.surveyMediaRepository.save({
      ...createSurveyMediaDto,
      featured: newFeatured || (!featuredMedia && !createSurveyMediaDto.hidden),
      type: MediaType.Image,
      surveyId: survey,
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
      .innerJoin('survey.userId', 'users')
      .leftJoinAndSelect(
        'survey.featuredSurveyMedia',
        'featuredSurveyMedia',
        'featuredSurveyMedia.featured = True',
      )
      .addSelect(['users.fullName', 'users.id'])
      .where('survey.reef_id = :reefId', { reefId })
      .getMany();

    return surveyHistoryQuery.map((survey) => {
      const surveyDailyData = survey.latestDailyData;
      return {
        id: survey.id,
        diveDate: survey.diveDate,
        comments: survey.comments,
        weatherConditions: survey.weatherConditions,
        userId: survey.userId,
        // If no logged temperature exists grab the latest daily temperature of the survey's date
        temperature:
          survey.temperature ||
          (surveyDailyData && surveyDailyData.avgBottomTemperature),
        featuredSurveyMedia: survey.featuredSurveyMedia,
      };
    });
  }

  // Find one survey provided its id
  // Include its surveyMedia grouped by reefPointOfInterest
  async findOne(surveyId: number): Promise<Survey> {
    const survey = await this.surveyRepository.findOne(surveyId);
    if (!survey) {
      throw new NotFoundException(`Survey with id ${surveyId} was not found`);
    }

    const reefPointsOfInterest = await this.poiRepository
      .createQueryBuilder('poi')
      .leftJoinAndSelect('poi.surveyMedia', 'surveyMedia')
      .where('surveyMedia.surveyId = :surveyId', { surveyId })
      .andWhere('surveyMedia.hidden = False')
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

    const returnValue: Survey = {
      surveyPoints: reefPointsOfInterest,
      ...survey,
    };

    return returnValue;
  }

  async findMedia(surveyId: number): Promise<SurveyMedia[]> {
    return this.surveyMediaRepository
      .createQueryBuilder('surveyMedia')
      .leftJoinAndSelect('surveyMedia.poiId', 'poi')
      .where('surveyMedia.surveyId = :surveyId', { surveyId })
      .getMany();
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
    const surveyMedia = await this.surveyMediaRepository.findOne(mediaId);

    if (!surveyMedia) {
      throw new NotFoundException(
        `Survey media with id ${mediaId} was not found`,
      );
    }

    if (
      surveyMedia.featured &&
      (editSurveyMediaDto.hidden || !editSurveyMediaDto.featured)
    ) {
      await this.assignFeaturedMedia(surveyMedia.surveyId.id, mediaId);
    }

    if (
      !surveyMedia.featured &&
      !editSurveyMediaDto.hidden &&
      editSurveyMediaDto.featured
    ) {
      await this.surveyMediaRepository.update(
        {
          surveyId: surveyMedia.surveyId,
          featured: true,
        },
        { featured: false },
      );
    }

    await this.surveyMediaRepository.update(mediaId, {
      ...editSurveyMediaDto,
      featured: !editSurveyMediaDto.hidden && editSurveyMediaDto.featured,
    });

    const updated = await this.surveyMediaRepository.findOne(mediaId);

    if (!updated) {
      throw new InternalServerErrorException('Something went wrong');
    }

    return updated;
  }

  async delete(surveyId: number): Promise<void> {
    const surveyMedia = await this.surveyMediaRepository.find({
      where: { surveyId },
    });

    await Promise.all(
      surveyMedia.map((media) => {
        // We need to grab the path/to/file. So we split the url on "{GCS_BUCKET}/"
        return this.googleCloudService.deleteFile(
          media.url.split(`${process.env.GCS_BUCKET}/`)[1],
        );
      }),
    );

    const result = await this.surveyRepository.delete(surveyId);

    if (!result.affected) {
      throw new NotFoundException(`Survey with id ${surveyId} was not found`);
    }
  }

  async deleteMedia(mediaId: number): Promise<void> {
    const surveyMedia = await this.surveyMediaRepository.findOne(mediaId);

    if (!surveyMedia) {
      throw new NotFoundException(
        `Survey media with id ${mediaId} was not found`,
      );
    }

    if (surveyMedia.featured) {
      await this.assignFeaturedMedia(surveyMedia.surveyId.id, mediaId);
    }

    // We need to grab the path/to/file. So we split the url on "{GCS_BUCKET}/"
    // and grab the second element of the resulting array which is the path we need
    // await this.googleCloudService.deleteFile(
    //   surveyMedia.url.split(`${process.env.GCS_BUCKET}/`)[1],
    // );

    await this.surveyMediaRepository.delete(mediaId);
  }

  private async assignFeaturedMedia(surveyId: number, mediaId: number) {
    const surveyMedia = await this.surveyMediaRepository
      .createQueryBuilder('surveyMedia')
      .where('surveyMedia.surveyId = :surveyId ', { surveyId })
      .andWhere('id != :mediaId', { mediaId })
      .andWhere('hidden != True')
      .getOne();

    if (!surveyMedia) {
      return;
    }

    await this.surveyMediaRepository.update(surveyMedia.id, { featured: true });
  }
}
