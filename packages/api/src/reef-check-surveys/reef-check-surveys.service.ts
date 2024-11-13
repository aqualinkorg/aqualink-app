import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReefCheckSurvey } from './reef-check-surveys.entity';

@Injectable()
export class ReefCheckSurveysService {
  private readonly logger = new Logger(ReefCheckSurveysService.name);

  constructor(
    @InjectRepository(ReefCheckSurvey)
    private reefCheckSurveyRepository: Repository<ReefCheckSurvey>,
  ) {}

  async find(reefCheckSiteId: string): Promise<ReefCheckSurvey[]> {
    return this.reefCheckSurveyRepository.find({
      where: { reefCheckSiteId },
      relations: ['organisms'],
    });
  }

  async findOne(id: string): Promise<ReefCheckSurvey> {
    const reefCheckSurvey = await this.reefCheckSurveyRepository.findOne({
      where: { id },
      relations: ['organisms'],
    });

    if (!reefCheckSurvey) {
      throw new NotFoundException(`No site was found with the specified id`);
    }

    return reefCheckSurvey;
  }
}
