import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getAllColumns } from 'utils/site.utils';
import { ReefCheckSurvey } from './reef-check-surveys.entity';

@Injectable()
export class ReefCheckSurveysService {
  private readonly logger = new Logger(ReefCheckSurveysService.name);

  constructor(
    @InjectRepository(ReefCheckSurvey)
    private reefCheckSurveyRepository: Repository<ReefCheckSurvey>,
  ) {}

  async find(siteId: number): Promise<ReefCheckSurvey[]> {
    return this.reefCheckSurveyRepository.find({
      where: { siteId },
      relations: ['organisms', 'substrates', 'reefCheckSite'],
    });
  }

  async findOne(id: string): Promise<ReefCheckSurvey> {
    const reefCheckSurvey = await this.reefCheckSurveyRepository.findOne({
      where: { id },
      relations: ['organisms', 'substrates', 'reefCheckSite'],
      // Using getAllColumns to include VirtualColumns - they are not included by default
      select: getAllColumns(this.reefCheckSurveyRepository),
    });

    if (!reefCheckSurvey) {
      throw new NotFoundException(`No site was found with the specified id`);
    }

    return reefCheckSurvey;
  }
}
