import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Survey } from '../surveys/surveys.entity';
import { CronJobs } from './tasks.constants';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(Survey)
    private surveyRepository: Repository<Survey>,
  ) {}

  @Cron('0 0-23/2 * * *', { name: CronJobs.DeleteEmptySurveys })
  async deleteEmptySurveys() {
    this.logger.log('Deleting empty surveys.');

    const emptySurveys = await this.surveyRepository
      .createQueryBuilder('survey')
      .leftJoin('survey.surveyMedia', 'surveyMedia')
      .where('surveyMedia.id is NULL')
      .andWhere("survey.createdAt < now() - INTERVAL '2 hour'")
      .select('survey.id')
      .getMany();

    this.logger.log(`Found ${emptySurveys.length} empty survey(s).`);
    const emptyKeys = emptySurveys.map((survey) => survey.id);

    if (emptySurveys.length) {
      const results = await this.surveyRepository
        .createQueryBuilder('survey')
        .where('survey.id IN (:...ids)', { ids: emptyKeys })
        .delete()
        .execute();

      this.logger.log(`Deleted ${results.affected} empty survey(s).`);
    } else {
      this.logger.log('Skipping deletion');
    }
  }
}
