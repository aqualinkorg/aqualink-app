import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReefApplication } from './reef-applications.entity';
import { CreateReefApplicationDto } from './dto/create-reef-application.dto';
import {
  UpdateReefApplicationDto,
  UpdateReefWithApplicationDto,
} from './dto/update-reef-application.dto';
import { CreateReefDto } from '../reefs/dto/create-reef.dto';
import { Reef } from '../reefs/reefs.entity';

@Injectable()
export class ReefApplicationsService {
  constructor(
    @InjectRepository(ReefApplication)
    private appRepo: Repository<ReefApplication>,
    @InjectRepository(Reef)
    private reefRepo: Repository<Reef>,
  ) {}

  async create(
    appParams: CreateReefApplicationDto,
    reefParams: CreateReefDto,
  ): Promise<ReefApplication> {
    const reef = await this.reefRepo.save(reefParams);
    return this.appRepo.save({
      ...appParams,
      reef,
    });
  }

  findOne(id: number, uid: string): Promise<ReefApplication> {
    try {
      return this.appRepo.findOneOrFail({
        where: { id, uid },
        relations: ['reef', 'user'],
      });
    } catch (err) {
      throw new NotFoundException(
        `ReefApplication with ID ${id} and UID ${uid} not found.`,
      );
    }
  }

  async update(
    id: number,
    uid: string,
    appParams: UpdateReefApplicationDto,
    reefParams: UpdateReefWithApplicationDto,
  ): Promise<ReefApplication> {
    const app = await this.appRepo.findOne({
      where: { id, uid },
      relations: ['reef'],
    });
    if (!app) {
      throw new NotFoundException(
        `Reef Application with ID ${id} and UID ${uid} not found.`,
      );
    }

    const res = await this.appRepo.update(app.id, appParams);
    await this.reefRepo.update(app.reef.id, reefParams);
    return res.generatedMaps[0] as ReefApplication;
  }
}
