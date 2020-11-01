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

  // Run task every 2 hours at 00 minutes.
  @Cron('0 */2 * * *', { name: CronJobs.DeleteEmptySurveys })
  async deleteEmptySurveys() {
    const emptySurveys = await this.surveyRepository
      .createQueryBuilder('survey')
      .leftJoin('survey.surveyMedia', 'surveyMedia')
      .where('surveyMedia.id is NULL')
      .andWhere("survey.createdAt < now() - INTERVAL '2 hour'")
      .select('survey.id')
      .getMany();

    const emptyKeys = emptySurveys.map((survey) => survey.id);

    if (emptySurveys.length) {
      const results = await this.surveyRepository
        .createQueryBuilder('survey')
        .where('survey.id IN (:...ids)', { ids: emptyKeys })
        .delete()
        .execute();

      this.logger.log(`Deleted ${results.affected} empty survey(s).`);
    } else {
      this.logger.debug('No empty surveys to delete.');
    }
  }
}
