import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { isNil, omit } from 'lodash';
import { Reef, ReefStatus } from './reefs.entity';
import { DailyData } from './daily-data.entity';
import { FilterReefDto } from './dto/filter-reef.dto';
import { UpdateReefDto } from './dto/update-reef.dto';
import { getLiveData } from '../utils/liveData';
import { SofarLiveData } from '../utils/sofar.types';
import { getWeeklyAlertLevel, getMaxAlert } from '../workers/dailyData';
import { User } from '../users/users.entity';
import { CreateReefDto } from './dto/create-reef.dto';
import { Region } from '../regions/regions.entity';
import {
  getRegion,
  getTimezones,
  handleDuplicateReef,
  getConflictingExclusionDate,
  getConflictingExclusionDates,
  filterSpotterDataByDate,
} from '../utils/reef.utils';
import { getMMM } from '../utils/temperature';
import { getSpotterData } from '../utils/sofar';
import { ExclusionDates } from './exclusion-dates.entity';
import { DeploySpotterDto } from './dto/deploy-spotter.dto';
import { MaintainSpotterDto } from './dto/maintain-spotter.dto';

@Injectable()
export class ReefsService {
  private readonly logger = new Logger(ReefsService.name);
  constructor(
    @InjectRepository(Reef)
    private reefsRepository: Repository<Reef>,

    @InjectRepository(DailyData)
    private dailyDataRepository: Repository<DailyData>,

    @InjectRepository(Region)
    private regionRepository: Repository<Region>,

    @InjectRepository(ExclusionDates)
    private exclusionDatesRepository: Repository<ExclusionDates>,
  ) {}

  async create(createReefDto: CreateReefDto): Promise<Reef> {
    const {
      name,
      latitude,
      longitude,
      temperatureThreshold,
      depth,
      videoStream,
      admins,
      stream,
    } = createReefDto;
    const region = await getRegion(longitude, latitude, this.regionRepository);
    const maxMonthlyMean = await getMMM(longitude, latitude);
    const timezones = getTimezones(latitude, longitude) as string[];
    const reef = await this.reefsRepository
      .save({
        name,
        region,
        polygon: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        maxMonthlyMean,
        timezones,
        temperatureThreshold,
        depth,
        videoStream,
        stream,
      })
      .catch(handleDuplicateReef);

    this.reefsRepository
      .createQueryBuilder('reefs')
      .update()
      .relation('admins')
      .of(reef)
      .add(admins);

    return reef;
  }

  latestDailyDataSubquery(): string {
    const query = this.dailyDataRepository.createQueryBuilder('dailyData');
    query.select('MAX(date)', 'date');
    query.addSelect('reef_id');
    query.groupBy('reef_id');
    return query.getQuery();
  }

  async find(filter: FilterReefDto): Promise<Reef[]> {
    const query = this.reefsRepository.createQueryBuilder('reef');
    if (filter.name) {
      query.andWhere('(lower(reef.name) LIKE :name)', {
        name: `%${filter.name.toLowerCase()}%`,
      });
    }
    if (filter.status) {
      query.andWhere('reef.status = :status', { status: filter.status });
    }
    if (filter.region) {
      query.andWhere('reef.region = :region', {
        region: filter.region,
      });
    }
    if (filter.admin) {
      query.innerJoin(
        'reef.admins',
        'adminsAssociation',
        'adminsAssociation.id = :adminId',
        { adminId: filter.admin },
      );
    }
    query.leftJoinAndSelect('reef.region', 'region');
    query.leftJoinAndSelect('reef.admins', 'admins');
    query.leftJoinAndSelect('reef.stream', 'stream');
    query.leftJoinAndSelect(
      'reef.latestDailyData',
      'latestDailyData',
      `(latestDailyData.date, latestDailyData.reef_id) IN (${this.latestDailyDataSubquery()})`,
    );
    query.andWhere('approved = true');
    return query.getMany();
  }

  async findOne(id: number): Promise<Reef> {
    const found = await this.reefsRepository.findOne(id, {
      relations: ['region', 'admins', 'stream'],
    });

    if (!found) {
      throw new NotFoundException(`Reef with ID ${id} not found.`);
    }

    return found;
  }

  async update(id: number, updateReefDto: UpdateReefDto): Promise<Reef> {
    const { coordinates, admins } = updateReefDto;
    const result = await this.reefsRepository
      .update(id, {
        ...omit(updateReefDto, ['admins', 'coordinates']),
        ...(coordinates
          ? {
              polygon: {
                type: 'Point',
                coordinates: [coordinates.longitude, coordinates.latitude],
              },
            }
          : {}),
      })
      .catch(handleDuplicateReef);

    if (admins) {
      await this.updateAdmins(id, admins);
    }

    if (!result.affected) {
      throw new NotFoundException(`Reef with ID ${id} not found.`);
    }

    const updated = await this.reefsRepository.findOne(id, {
      relations: ['admins'],
    });

    if (!updated) {
      throw new InternalServerErrorException('Something went wrong.');
    }

    return updated;
  }

  async delete(id: number): Promise<void> {
    const result = await this.reefsRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Reef with ID ${id} not found.`);
    }
  }

  async findDailyData(id: number): Promise<DailyData[]> {
    const reef = await this.reefsRepository.findOne(id);

    if (!reef) {
      throw new NotFoundException(`Reef with ID ${id} not found.`);
    }

    return this.dailyDataRepository.find({
      where: { reef: id },
      order: {
        date: 'DESC',
      },
      take: 90,
    });
  }

  async findLiveData(id: number): Promise<SofarLiveData> {
    const reef = await this.reefsRepository.findOne(id);

    if (!reef) {
      throw new NotFoundException(`Reef with ID ${id} not found.`);
    }

    const now = new Date();

    const weeklyAlertLevel = await getWeeklyAlertLevel(
      this.dailyDataRepository,
      now,
      reef,
    );

    const includeSpotterData = Boolean(
      reef.spotterId &&
        reef.status === ReefStatus.Deployed &&
        isNil(
          await getConflictingExclusionDate(
            this.exclusionDatesRepository,
            reef.spotterId,
            now,
            now,
          ),
        ),
    );

    const liveData = await getLiveData(reef, includeSpotterData);

    return {
      ...liveData,
      weeklyAlertLevel: getMaxAlert(liveData.dailyAlertLevel, weeklyAlertLevel),
    };
  }

  async getSpotterData(id: number, startDate: Date, endDate: Date) {
    const reef = await this.reefsRepository.findOne(id);

    if (!reef) {
      throw new NotFoundException(`Reef with ID ${id} not found.`);
    }

    if (!reef.spotterId) {
      throw new NotFoundException(`Reef with ${id} has no spotter.`);
    }

    const exclusionDates = await getConflictingExclusionDates(
      this.exclusionDatesRepository,
      reef.spotterId,
      startDate,
      endDate,
    );

    const { surfaceTemperature, bottomTemperature } = await getSpotterData(
      reef.spotterId,
      endDate,
      startDate,
    );

    return {
      surfaceTemperature: filterSpotterDataByDate(
        surfaceTemperature,
        exclusionDates,
      ),
      bottomTemperature: filterSpotterDataByDate(
        bottomTemperature,
        exclusionDates,
      ),
    };
  }

  async deploySpotter(id: number, deploySpotterDto: DeploySpotterDto) {
    const { endDate } = deploySpotterDto;

    const reef = await this.reefsRepository.findOne({
      id,
      spotterId: Not(IsNull()),
      status: Not(ReefStatus.Deployed),
    });

    if (!reef) {
      throw new NotFoundException(`Reef with ID ${id} not found`);
    }

    // Run update queries concurrently
    await Promise.all([
      this.reefsRepository.update(id, {
        status: ReefStatus.Deployed,
      }),
      this.exclusionDatesRepository.save({
        spotterId: reef.spotterId,
        endDate,
      }),
    ]);
  }

  async maintainSpotter(id: number, maintainSpotterDto: MaintainSpotterDto) {
    const { startDate, endDate } = maintainSpotterDto;

    const reef = await this.reefsRepository.findOne({
      id,
      spotterId: Not(IsNull()),
      status: ReefStatus.Deployed,
    });

    if (!reef) {
      throw new NotFoundException(`Reef with ID ${id} not found`);
    }

    if (startDate >= endDate) {
      throw new BadRequestException(
        'Start date should be less than the end date',
      );
    }

    await this.exclusionDatesRepository.save({
      spotterId: reef.spotterId,
      endDate,
      startDate,
    });
  }

  async getExclusionDates(id: number) {
    const reef = await this.reefsRepository.findOne({
      id,
      spotterId: Not(IsNull()),
      status: ReefStatus.Deployed,
    });

    if (!reef) {
      throw new NotFoundException(`Reef with ID ${id} not found`);
    }

    return this.exclusionDatesRepository.find({
      where: {
        spotterId: reef.spotterId,
      },
    });
  }

  private async updateAdmins(id: number, admins: User[]) {
    const reef = await this.reefsRepository.findOne(id, {
      relations: ['admins'],
    });
    if (!reef) {
      throw new NotFoundException(`Reef with ID ${id} not found.`);
    }

    await this.reefsRepository
      .createQueryBuilder('reefs')
      .update()
      .relation('admins')
      .of(reef)
      .addAndRemove(admins, reef.admins);
  }
}
