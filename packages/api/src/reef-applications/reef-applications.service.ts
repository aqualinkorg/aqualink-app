import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReefApplication } from './reef-applications.entity';
import {
  CreateReefApplicationDto,
  CreateReefWithApplicationDto,
} from './dto/create-reef-application.dto';
import {
  UpdateReefApplicationDto,
  UpdateReefWithApplicationDto,
} from './dto/update-reef-application.dto';
import { Reef } from '../reefs/reefs.entity';
import { Region } from '../regions/regions.entity';
import {
  getRegion,
  getTimezones,
  handleDuplicateReef,
} from '../utils/reef.utils';
import { getMMM } from '../utils/temperature';
import { AdminLevel, User } from '../users/users.entity';
import { backfillReefData } from '../workers/backfill-reef-data';
import { FilterReefApplication } from './dto/filter-reef-application.dto';

@Injectable()
export class ReefApplicationsService {
  private logger = new Logger(ReefApplicationsService.name);
  constructor(
    @InjectRepository(ReefApplication)
    private reefApplicationRepository: Repository<ReefApplication>,
    @InjectRepository(Reef)
    private reefRepository: Repository<Reef>,
    @InjectRepository(Region)
    private regionRepository: Repository<Region>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(
    appParams: CreateReefApplicationDto,
    reefParams: CreateReefWithApplicationDto,
    user: User,
  ): Promise<ReefApplication> {
    const { longitude, latitude, depth, name } = reefParams;
    const region = await getRegion(longitude, latitude, this.regionRepository);
    const maxMonthlyMean = await getMMM(longitude, latitude);
    const timezones = getTimezones(latitude, longitude) as string[];

    const reef = await this.reefRepository
      .save({
        name,
        depth,
        polygon: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        maxMonthlyMean,
        timezone: timezones[0],
        approved: false,
        region,
      })
      .catch(handleDuplicateReef);

    // Elevate user to ReefManager
    if (user.adminLevel === AdminLevel.Default) {
      await this.userRepository.update(user.id, {
        adminLevel: AdminLevel.ReefManager,
      });
    }

    // Add reef ownership to user
    await this.userRepository
      .createQueryBuilder('users')
      .relation('administeredReefs')
      .of(user)
      .add(reef);

    if (!maxMonthlyMean) {
      this.logger.warn(
        `Max Monthly Mean appears to be null for Reef ${reef.id} at (lat, lon): (${latitude}, ${longitude}) `,
      );
    }

    backfillReefData(reef.id);

    return this.reefApplicationRepository.save({
      ...appParams,
      reef,
      user,
    });
  }

  find(filters: FilterReefApplication): Promise<ReefApplication[]> {
    const query = this.reefApplicationRepository.createQueryBuilder(
      'reefApplication',
    );

    if (filters.reef) {
      query.andWhere('reef_id = :reef_id', { reef_id: filters.reef });
    }

    if (filters.user) {
      query.andWhere('user_id = :user_id', { user_id: filters.user });
    }

    return query.getMany();
  }

  findOne(id: number): Promise<ReefApplication> {
    try {
      return this.reefApplicationRepository.findOneOrFail({
        where: { id },
        relations: ['reef', 'user'],
      });
    } catch (err) {
      throw new NotFoundException(`ReefApplication with ID ${id} not found.`);
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
