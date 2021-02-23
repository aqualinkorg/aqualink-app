import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReefApplication } from './reef-applications.entity';
import {
  UpdateReefApplicationDto,
  UpdateReefWithApplicationDto,
} from './dto/update-reef-application.dto';
import { Reef } from '../reefs/reefs.entity';

@Injectable()
export class ReefApplicationsService {
  private logger = new Logger(ReefApplicationsService.name);
  constructor(
    @InjectRepository(ReefApplication)
    private reefApplicationRepository: Repository<ReefApplication>,
    @InjectRepository(Reef)
    private reefRepository: Repository<Reef>,
  ) {}

  async findOneFromReef(reefId: number): Promise<ReefApplication> {
    const application = await this.reefApplicationRepository.findOne({
      where: {
        reef: reefId,
      },
      relations: ['reef', 'user'],
    });

    if (!application) {
      throw new NotFoundException(
        `Reef Application for reef with ID ${reefId} not found.`,
      );
    }

    return application;
  }

  findOne(id: number): Promise<ReefApplication> {
    try {
      return this.reefApplicationRepository.findOneOrFail({
        where: { id },
        relations: ['reef', 'user'],
      });
    } catch (err) {
      throw new NotFoundException(`Reef Application with ID ${id} not found.`);
    }
  }

  async update(
    id: number,
    appParams: UpdateReefApplicationDto,
    reefParams: UpdateReefWithApplicationDto,
  ): Promise<ReefApplication> {
    const app = await this.reefApplicationRepository.findOne({
      where: { id },
      relations: ['reef'],
    });
    if (!app) {
      throw new NotFoundException(`Reef Application with ID ${id} not found.`);
    }

    const res = await this.reefApplicationRepository.update(app.id, appParams);
    await this.reefRepository.update(app.reef.id, reefParams);
    return res.generatedMaps[0] as ReefApplication;
  }
}
