import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { omit } from 'lodash';
import { Reef, ReefStatus } from './reefs.entity';
import { DailyData } from './daily-data.entity';
import { FilterReefDto } from './dto/filter-reef.dto';
import { UpdateReefDto } from './dto/update-reef.dto';
import { getLiveData } from '../utils/liveData';
import { SofarLiveData } from '../utils/sofar.types';
import { getWeeklyAlertLevel, getMaxAlert } from '../workers/dailyData';
import { AdminLevel, User } from '../users/users.entity';
import { CreateReefDto, CreateReefApplicationDto } from './dto/create-reef.dto';
import { MonthlyMax } from './monthly-max.entity';
import { Region } from '../regions/regions.entity';
import {
  getRegion,
  getTimezones,
  handleDuplicateReef,
  filterSpotterDataByDate,
  getConflictingExclusionDates,
} from '../utils/reef.utils';
import { getMMM, getMonthlyMaximums } from '../utils/temperature';
import { getSpotterData } from '../utils/sofar';
import { ExclusionDates } from './exclusion-dates.entity';
import { DeploySpotterDto } from './dto/deploy-spotter.dto';
import { ExcludeSpotterDatesDto } from './dto/exclude-spotter-dates.dto';
import { backfillReefData } from '../workers/backfill-reef-data';
import { ReefApplication } from '../reef-applications/reef-applications.entity';

@Injectable()
export class ReefsService {
  private readonly logger = new Logger(ReefsService.name);
  constructor(
    @InjectRepository(Reef)
    private reefsRepository: Repository<Reef>,

    @InjectRepository(ReefApplication)
    private reefApplicationRepository: Repository<ReefApplication>,

    @InjectRepository(DailyData)
    private dailyDataRepository: Repository<DailyData>,

    @InjectRepository(Region)
    private regionRepository: Repository<Region>,

    @InjectRepository(ExclusionDates)
    private exclusionDatesRepository: Repository<ExclusionDates>,

    @InjectRepository(MonthlyMax)
    private monthlyMaxRepository: Repository<MonthlyMax>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(
    appParams: CreateReefApplicationDto,
    reefParams: CreateReefDto,
    user: User,
  ): Promise<ReefApplication> {
    const { name, latitude, longitude, depth } = reefParams;
    const region = await getRegion(longitude, latitude, this.regionRepository);
    const maxMonthlyMean = await getMMM(longitude, latitude);
    const monthlyMaximums = await getMonthlyMaximums(longitude, latitude);

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
        timezone: timezones[0],
        approved: false,
        depth,
      })
      .catch(handleDuplicateReef);

    // Elevate user to ReefManager
    if (user.adminLevel === AdminLevel.Default) {
      await this.userRepository.update(user.id, {
        adminLevel: AdminLevel.ReefManager,
      });
    }

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

    await Promise.all(
      monthlyMaximums.map(async ({ month, temperature }) => {
        return (
          temperature &&
          this.monthlyMaxRepository.insert({ reef, month, temperature })
        );
      }),
    );

    return this.reefApplicationRepository.save({
      ...appParams,
      reef,
      user,
    });
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
      relations: ['region', 'admins', 'stream', 'monthlyMax'],
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
      reef.spotterId && reef.status === ReefStatus.Deployed,
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

    const reef = await this.reefsRepository.findOne(id);

    if (!reef) {
      throw new NotFoundException(`Reef with ID ${id} not found`);
    }

    if (!reef.spotterId) {
      throw new BadRequestException(`Reef with ID ${id} has no spotter`);
    }

    if (reef.status === ReefStatus.Deployed) {
      throw new BadRequestException(`Reef with ID ${id} is already deployed`);
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

  async addExclusionDates(
    id: number,
    excludeSpotterDatesDto: ExcludeSpotterDatesDto,
  ) {
    const { startDate, endDate } = excludeSpotterDatesDto;

    const reef = await this.reefsRepository.findOne(id);

    if (!reef) {
      throw new NotFoundException(`Reef with ID ${id} not found`);
    }

    if (!reef.spotterId) {
      throw new BadRequestException(`Reef with ID ${id} has no spotter`);
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
    const reef = await this.reefsRepository.findOne(id);

    if (!reef) {
      throw new NotFoundException(`Reef with ID ${id} not found`);
    }

    if (!reef.spotterId) {
      throw new BadRequestException(`Reef with ID ${id} has no spotter`);
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
