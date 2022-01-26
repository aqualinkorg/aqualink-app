import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { omit } from 'lodash';
import moment from 'moment';
import { Site, SiteStatus } from './sites.entity';
import { DailyData } from './daily-data.entity';
import { FilterSiteDto } from './dto/filter-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { getSstAnomaly, getLiveData } from '../utils/liveData';
import { SofarLiveData } from '../utils/sofar.types';
import { getWeeklyAlertLevel, getMaxAlert } from '../workers/dailyData';
import { AdminLevel, User } from '../users/users.entity';
import { CreateSiteDto, CreateSiteApplicationDto } from './dto/create-site.dto';
import { HistoricalMonthlyMean } from './historical-monthly-mean.entity';
import { Region } from '../regions/regions.entity';
import {
  getRegion,
  getTimezones,
  handleDuplicateSite,
  filterSpotterDataByDate,
  getConflictingExclusionDates,
  hasHoboDataSubQuery,
  getLatestData,
  getSSTFromLiveOrLatestData,
  getSite,
} from '../utils/site.utils';
import { getMMM, getHistoricalMonthlyMeans } from '../utils/temperature';
import { getSpotterData } from '../utils/sofar';
import { ExclusionDates } from './exclusion-dates.entity';
import { DeploySpotterDto } from './dto/deploy-spotter.dto';
import { ExcludeSpotterDatesDto } from './dto/exclude-spotter-dates.dto';
import { backfillSiteData } from '../workers/backfill-site-data';
import { SiteApplication } from '../site-applications/site-applications.entity';
import { createPoint } from '../utils/coordinates';
import { Sources } from './sources.entity';
import { getCollectionData } from '../utils/collections.utils';
import { LatestData } from '../time-series/latest-data.entity';
import { getYouTubeVideoId } from '../utils/urls';
import {
  fetchVideoDetails,
  getErrorMessage,
} from '../workers/check-video-streams';
import { getTimeSeriesDefaultDates } from '../utils/dates';

@Injectable()
export class SitesService {
  private readonly logger = new Logger(SitesService.name);
  constructor(
    @InjectRepository(Site)
    private sitesRepository: Repository<Site>,

    @InjectRepository(SiteApplication)
    private siteApplicationRepository: Repository<SiteApplication>,

    @InjectRepository(DailyData)
    private dailyDataRepository: Repository<DailyData>,

    @InjectRepository(Region)
    private regionRepository: Repository<Region>,

    @InjectRepository(ExclusionDates)
    private exclusionDatesRepository: Repository<ExclusionDates>,

    @InjectRepository(HistoricalMonthlyMean)
    private historicalMonthlyMeanRepository: Repository<HistoricalMonthlyMean>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Sources)
    private sourceRepository: Repository<Sources>,

    @InjectRepository(LatestData)
    private latestDataRepository: Repository<LatestData>,
  ) {}

  async create(
    appParams: CreateSiteApplicationDto,
    siteParams: CreateSiteDto,
    user: User,
  ): Promise<SiteApplication> {
    const { name, latitude, longitude, depth } = siteParams;
    const region = await getRegion(longitude, latitude, this.regionRepository);
    const maxMonthlyMean = await getMMM(longitude, latitude);
    const historicalMonthlyMeans = await getHistoricalMonthlyMeans(
      longitude,
      latitude,
    );

    const timezones = getTimezones(latitude, longitude) as string[];

    const site = await this.sitesRepository
      .save({
        name,
        region,
        polygon: createPoint(longitude, latitude),
        maxMonthlyMean,
        timezone: timezones[0],
        approved: false,
        depth,
      })
      .catch(handleDuplicateSite);

    // Elevate user to SiteManager
    if (user.adminLevel === AdminLevel.Default) {
      await this.userRepository.update(user.id, {
        adminLevel: AdminLevel.SiteManager,
      });
    }

    await this.userRepository
      .createQueryBuilder('users')
      .relation('administeredSites')
      .of(user)
      .add(site);

    if (!maxMonthlyMean) {
      this.logger.warn(
        `Max Monthly Mean appears to be null for Site ${site.id} at (lat, lon): (${latitude}, ${longitude}) `,
      );
    }

    backfillSiteData(site.id);

    await Promise.all(
      historicalMonthlyMeans.map(async ({ month, temperature }) => {
        return (
          temperature &&
          this.historicalMonthlyMeanRepository.insert({
            site,
            month,
            temperature,
          })
        );
      }),
    );

    return this.siteApplicationRepository.save({
      ...appParams,
      site,
      user,
    });
  }

  async find(filter: FilterSiteDto): Promise<Site[]> {
    const query = this.sitesRepository.createQueryBuilder('site');

    if (filter.name) {
      query.andWhere('(lower(site.name) LIKE :name)', {
        name: `%${filter.name.toLowerCase()}%`,
      });
    }

    if (filter.status) {
      query.andWhere('site.status = :status', { status: filter.status });
    }

    if (filter.regionId) {
      query.andWhere('site.region = :region', {
        region: filter.regionId,
      });
    }

    if (filter.adminId) {
      query.innerJoin(
        'site.admins',
        'adminsAssociation',
        'adminsAssociation.id = :adminId',
        { adminId: filter.adminId },
      );
    }

    if (filter.hasSpotter) {
      const hasSpotter = filter.hasSpotter.toLowerCase() === 'true';
      query.andWhere(
        hasSpotter ? 'site.sensor_id IS NOT NULL' : 'site.sensor_id IS NULL',
      );
    }

    const res = await query
      .leftJoinAndSelect('site.region', 'region')
      .leftJoinAndSelect('site.admins', 'admins')
      .leftJoinAndSelect('site.stream', 'stream')
      .andWhere('approved = true')
      .getMany();

    const mappedSiteData = await getCollectionData(
      res,
      this.latestDataRepository,
    );

    const hasHoboDataSet = await hasHoboDataSubQuery(this.sourceRepository);

    return res.map((site) => ({
      ...site,
      applied: site.applied,
      collectionData: mappedSiteData[site.id],
      hasHobo: hasHoboDataSet.has(site.id),
    }));
  }

  async findOne(id: number): Promise<Site> {
    const site = await getSite(id, this.sitesRepository, [
      'region',
      'admins',
      'stream',
      'historicalMonthlyMean',
      'siteApplication',
    ]);

    const videoStream = await this.checkVideoStream(site);

    return { ...site, videoStream, applied: site.applied };
  }

  async update(id: number, updateSiteDto: UpdateSiteDto): Promise<Site> {
    const { coordinates, adminIds, regionId, streamId } = updateSiteDto;
    const updateRegion =
      regionId !== undefined ? { region: { id: regionId } } : {};
    const updateStream =
      streamId !== undefined ? { region: { id: streamId } } : {};
    const updateCoordinates = coordinates
      ? {
          polygon: createPoint(coordinates.longitude, coordinates.latitude),
        }
      : {};

    const result = await this.sitesRepository
      .update(id, {
        ...omit(updateSiteDto, [
          'adminIds',
          'coordinates',
          'regionId',
          'streamId',
        ]),
        ...updateRegion,
        ...updateStream,
        ...updateCoordinates,
      })
      .catch(handleDuplicateSite);

    if (adminIds) {
      await this.updateAdmins(id, adminIds);
    }

    if (!result.affected) {
      throw new NotFoundException(`Site with ID ${id} not found.`);
    }

    const updated = await this.sitesRepository.findOne(id, {
      relations: ['admins'],
    });

    return updated!;
  }

  async delete(id: number): Promise<void> {
    const result = await this.sitesRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Site with ID ${id} not found.`);
    }
  }

  async findDailyData(
    id: number,
    start?: string,
    end?: string,
  ): Promise<DailyData[]> {
    await getSite(id, this.sitesRepository);

    if (!moment(start).isValid() || !moment(end).isValid()) {
      throw new BadRequestException('Start or end is not a valid date');
    }

    return this.dailyDataRepository
      .createQueryBuilder('daily_data')
      .where('site_id = :id', { id })
      .orderBy('date', 'DESC')
      .andWhere('date <= :endDate', {
        endDate: (end && new Date(end)) || new Date(),
      })
      .andWhere('date >= :startDate', {
        startDate: new Date(start || 0),
      })
      .limit(start && end ? undefined : 90)
      .getMany();
  }

  async findLiveData(id: number): Promise<SofarLiveData> {
    const site = await getSite(id, this.sitesRepository, [
      'historicalMonthlyMean',
    ]);

    const now = new Date();

    const weeklyAlertLevel = await getWeeklyAlertLevel(
      this.dailyDataRepository,
      now,
      site,
    );

    const isDeployed = site.status === SiteStatus.Deployed;

    const liveData = await getLiveData(site, isDeployed);

    const sst = await getSSTFromLiveOrLatestData(
      liveData,
      site,
      this.latestDataRepository,
    );

    const latestData = await getLatestData(site, this.latestDataRepository);

    return {
      ...liveData,
      latestData,
      sstAnomaly: getSstAnomaly(site.historicalMonthlyMean, sst),
      satelliteTemperature: sst,
      weeklyAlertLevel: getMaxAlert(liveData.dailyAlertLevel, weeklyAlertLevel),
    };
  }

  async getSpotterData(id: number, start?: string, end?: string) {
    const site = await getSite(id, this.sitesRepository);
    const { startDate, endDate } = getTimeSeriesDefaultDates(start, end);

    if (!site.sensorId) {
      throw new NotFoundException(`Site with ${id} has no spotter.`);
    }

    const exclusionDates = await getConflictingExclusionDates(
      this.exclusionDatesRepository,
      site.sensorId,
      startDate,
      endDate,
    );

    const { topTemperature, bottomTemperature } = await getSpotterData(
      site.sensorId,
      endDate,
      startDate,
    );

    return {
      topTemperature: filterSpotterDataByDate(topTemperature, exclusionDates),
      bottomTemperature: filterSpotterDataByDate(
        bottomTemperature,
        exclusionDates,
      ),
    };
  }

  async deploySpotter(id: number, deploySpotterDto: DeploySpotterDto) {
    const { endDate } = deploySpotterDto;

    const site = await getSite(id, this.sitesRepository);

    if (!site.sensorId) {
      throw new BadRequestException(`Site with ID ${id} has no spotter`);
    }

    if (site.status === SiteStatus.Deployed) {
      throw new BadRequestException(`Site with ID ${id} is already deployed`);
    }

    // Run update queries concurrently
    await Promise.all([
      this.sitesRepository.update(id, {
        status: SiteStatus.Deployed,
      }),
      this.exclusionDatesRepository.save({
        sensorId: site.sensorId,
        endDate,
      }),
    ]);
  }

  async addExclusionDates(
    id: number,
    excludeSpotterDatesDto: ExcludeSpotterDatesDto,
  ) {
    const { startDate, endDate } = excludeSpotterDatesDto;

    const site = await getSite(id, this.sitesRepository);

    if (!site.sensorId) {
      throw new BadRequestException(`Site with ID ${id} has no spotter`);
    }

    if (startDate >= endDate) {
      throw new BadRequestException(
        'Start date should be less than the end date',
      );
    }

    await this.exclusionDatesRepository.save({
      sensorId: site.sensorId,
      endDate,
      startDate,
    });
  }

  async getExclusionDates(id: number) {
    const site = await getSite(id, this.sitesRepository);

    if (!site.sensorId) {
      throw new BadRequestException(`Site with ID ${id} has no spotter`);
    }

    return this.exclusionDatesRepository.find({
      where: {
        sensorId: site.sensorId,
      },
    });
  }

  private async updateAdmins(id: number, adminIds: number[]) {
    const site = await getSite(id, this.sitesRepository, ['admins']);

    await this.sitesRepository
      .createQueryBuilder('sites')
      .update()
      .relation('admins')
      .of(site)
      .addAndRemove(adminIds, site.admins);
  }

  private async checkVideoStream(site: Site) {
    // Check if site has a video stream url
    if (!site.videoStream) {
      return null;
    }

    const apiKey = process.env.FIREBASE_API_KEY;

    // Api key must be specified for the process to continue
    if (!apiKey) {
      // Log an explicit error
      this.logger.error('No google api key was defined');
      return null;
    }

    const videoId = getYouTubeVideoId(site.videoStream);

    // Video id could not be extracted, because the video stream url wan not in the correct format
    if (!videoId) {
      return null;
    }

    const rsp = await fetchVideoDetails([videoId], apiKey);

    // Video was not found.
    if (!rsp.data.items.length) {
      return null;
    }

    const msg = getErrorMessage(rsp.data.items[0]);

    // An error was returned (Video is not live, it is not public etc).
    if (msg) {
      return null;
    }

    // All checks passed, return video stream url.
    return site.videoStream;
  }
}
