import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { omit } from 'lodash';
import Bluebird from 'bluebird';
import { sanitizeUrl } from '@braintree/sanitize-url';
import { DateTime } from '../luxon-extensions';
import { Site, SiteStatus } from './sites.entity';
import { DailyData } from './daily-data.entity';
import { FilterSiteDto } from './dto/filter-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { AdminLevel, User } from '../users/users.entity';
import { CreateSiteDto, CreateSiteApplicationDto } from './dto/create-site.dto';
import { HistoricalMonthlyMean } from './historical-monthly-mean.entity';
import { Region } from '../regions/regions.entity';
import {
  handleDuplicateSite,
  filterMetricDataByDate,
  getConflictingExclusionDates,
  hasHoboDataSubQuery,
  getLatestData,
  getSite,
  createSite,
} from '../utils/site.utils';
import { getSpotterData, sofarLatest } from '../utils/sofar';
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
import { getDefaultDates } from '../utils/dates';
import { SourceType } from './schemas/source-type.enum';
import { TimeSeries } from '../time-series/time-series.entity';
import { sendSlackMessage, SlackMessage } from '../utils/slack.utils';
import { ScheduledUpdate } from './scheduled-updates.entity';

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

    @InjectRepository(TimeSeries)
    private timeSeriesRepository: Repository<TimeSeries>,

    @InjectRepository(ScheduledUpdate)
    private scheduledUpdateRepository: Repository<ScheduledUpdate>,

    private dataSource: DataSource,
  ) {}

  async create(
    appParams: CreateSiteApplicationDto,
    siteParams: CreateSiteDto,
    user: User,
  ): Promise<SiteApplication> {
    const { name, latitude, longitude, depth } = siteParams;
    const site = await createSite(
      name,
      depth,
      longitude,
      latitude,
      this.regionRepository,
      this.sitesRepository,
      this.historicalMonthlyMeanRepository,
    );

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

    backfillSiteData({
      dataSource: this.dataSource,
      siteId: site.id,
    });

    const regionWarningMessage = site.region
      ? '\n:warning: *Warning*: No region was found for this site, please ask devs to enter one manually.'
      : '';

    const messageTemplate: SlackMessage = {
      channel: process.env.SLACK_BOT_CHANNEL as string,
      text: `New site ${site.name} created with id=${site.id}, by ${user.fullName}${regionWarningMessage}`,
      mrkdwn: true,
    };

    // Add site to scheduled noaa location updates
    await this.scheduledUpdateRepository.save({ site: { id: site.id } });

    await sendSlackMessage(
      messageTemplate,
      process.env.SLACK_BOT_TOKEN as string,
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
      .andWhere('display = true')
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

    // Typeorm returns undefined instead of [] for
    // OneToMany relations, so we fix it to match OpenAPI specs:
    const surveys = site.surveys || [];
    const historicalMonthlyMean = site.historicalMonthlyMean || [];

    const videoStream = await this.checkVideoStream(site);

    const mappedSiteData = await getCollectionData(
      [site],
      this.latestDataRepository,
    );

    return {
      ...site,
      surveys,
      historicalMonthlyMean,
      videoStream,
      applied: site.applied,
      collectionData: mappedSiteData[site.id],
    };
  }

  private checkIframeURL(iframe: string | undefined): string | undefined {
    if (!iframe) return undefined;

    const sanitizedIframeURL = sanitizeUrl(iframe);

    const trustedHosts = ['aqualink.org'];

    try {
      const iframeAsURL = new URL(sanitizedIframeURL);

      if (iframeAsURL.protocol !== 'https:')
        throw new Error('Invalid protocol');
      if (iframeAsURL.port !== '') throw new Error('Invalid port');
      if (!trustedHosts.find((x) => x === iframeAsURL.hostname))
        throw new Error('Invalid hostname');
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }

    return sanitizedIframeURL;
  }

  async update(
    id: number,
    updateSiteDto: UpdateSiteDto,
    user: User,
  ): Promise<Site> {
    if (
      (updateSiteDto.display ||
        updateSiteDto.status ||
        updateSiteDto.videoStream ||
        updateSiteDto.contactInformation) &&
      user.adminLevel !== AdminLevel.SuperAdmin
    ) {
      throw new ForbiddenException();
    }

    const { coordinates, adminIds, regionId, streamId, iframe } = updateSiteDto;
    const updateRegion =
      regionId !== undefined ? { region: { id: regionId } } : {};
    const updateStream =
      streamId !== undefined ? { region: { id: streamId } } : {};
    const updateCoordinates = coordinates
      ? {
          polygon: createPoint(coordinates.longitude, coordinates.latitude),
        }
      : {};

    const checkedIframe = this.checkIframeURL(iframe);
    const updateIframe = checkedIframe ? { iframe: checkedIframe } : {};

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
        ...updateIframe,
      })
      .catch(handleDuplicateSite);

    if (coordinates) {
      this.scheduledUpdateRepository.save({ site: { id } });
    }

    if (adminIds) {
      await this.updateAdmins(id, adminIds);
    }

    if (!result.affected) {
      throw new NotFoundException(`Site with ID ${id} not found.`);
    }

    const updated = await this.sitesRepository.findOne({
      where: { id },
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

    if (
      (start && !DateTime.fromISO(start).isValid) ||
      (end && !DateTime.fromISO(end).isValid)
    ) {
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

  async findSpotterPosition(id: number) {
    const site = await getSite(
      id,
      this.sitesRepository,
      ['historicalMonthlyMean'],
      true,
    );
    const isDeployed = site.status === SiteStatus.Deployed;

    const { sensorId } = site;
    if (!sensorId)
      return {
        timestamp: undefined,
        isDeployed,
        position: undefined,
      };

    const sofarToken = site.spotterApiToken || process.env.SOFAR_API_TOKEN;
    const spotterLatest = await sofarLatest({ sensorId, token: sofarToken });

    const lastTrack =
      spotterLatest.track &&
      spotterLatest.track.length &&
      spotterLatest.track[spotterLatest.track.length - 1];

    const spotterData = lastTrack
      ? {
          longitude: {
            value: lastTrack.longitude,
            timestamp: lastTrack.timestamp,
          },
          latitude: {
            value: lastTrack.latitude,
            timestamp: lastTrack.timestamp,
          },
        }
      : {};

    return {
      isDeployed,
      timestamp: spotterData.latitude?.timestamp,
      ...(spotterData.longitude &&
        spotterData.latitude && {
          position: {
            longitude: spotterData.longitude.value,
            latitude: spotterData.latitude.value,
          },
        }),
    };
  }

  async findLatestData(id: number): Promise<LatestData[]> {
    const site = await getSite(id, this.sitesRepository, [
      'historicalMonthlyMean',
    ]);

    return getLatestData(site, this.latestDataRepository);
  }

  async getSpotterData(id: number, start?: string, end?: string) {
    const site = await getSite(id, this.sitesRepository, undefined, true);
    const { startDate, endDate } = getDefaultDates(start, end);

    if (!site.sensorId) {
      throw new NotFoundException(`Site with ${id} has no spotter.`);
    }

    const exclusionDates = await getConflictingExclusionDates(
      this.exclusionDatesRepository,
      site.sensorId,
      startDate,
      endDate,
    );

    const sofarToken = site.spotterApiToken || process.env.SOFAR_API_TOKEN;
    const { topTemperature, bottomTemperature } = await getSpotterData(
      site.sensorId,
      sofarToken,
      endDate,
      startDate,
    );

    return {
      topTemperature:
        filterMetricDataByDate(exclusionDates, topTemperature) || [],
      bottomTemperature:
        filterMetricDataByDate(exclusionDates, bottomTemperature) || [],
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
    const dateFormat = 'LL/dd/yyyy HH:mm';
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

    const sources = await this.sourceRepository.find({
      where: {
        site: { id: site.id },
        type: SourceType.SPOTTER,
      },
    });

    Bluebird.Promise.each(sources, async (source) => {
      if (!source.sensorId) {
        throw new BadRequestException(
          'Cannot delete spotter with missing sensorId',
        );
      }

      this.logger.log(
        `Deleting time-series data for spotter ${source.sensorId} ; site ${site.id}`,
      );

      const alreadyExists = await this.exclusionDatesRepository.findOne({
        where: { sensorId: source.sensorId, startDate, endDate },
      });

      if (alreadyExists) {
        throw new ConflictException(
          `Exclusion period [${DateTime.fromJSDate(startDate).toFormat(
            dateFormat,
          )}, ${DateTime.fromJSDate(endDate).toFormat(
            dateFormat,
          )}] already exists for spotter ${source.sensorId}.`,
        );
      }

      await this.exclusionDatesRepository.save({
        sensorId: source.sensorId,
        endDate,
        startDate,
      });

      await this.timeSeriesRepository
        .createQueryBuilder('time-series')
        .where('source_id = :id', { id: source.id })
        .andWhere('timestamp <= :endDate', {
          endDate: new Date(endDate),
        })
        .andWhere('timestamp >= :startDate', {
          startDate: new Date(startDate),
        })
        .delete()
        .execute();
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

    const isPlaylist = site.videoStream.includes('videoseries');
    const apiKey = process.env.FIREBASE_API_KEY;

    // Api key must be specified for the process to continue
    if (!apiKey) {
      // Log an explicit error
      this.logger.error('No google api key was defined');
      return null;
    }

    const videoId = getYouTubeVideoId(site.videoStream, isPlaylist);

    // Video id could not be extracted, because the video stream url wan not in the correct format
    if (!videoId) {
      return null;
    }

    const rsp = await fetchVideoDetails([videoId], apiKey, isPlaylist);

    // Video was not found.
    if (!rsp.data.items.length) {
      return null;
    }

    const msg = getErrorMessage(rsp.data.items[0], isPlaylist);

    // An error was returned (Video is not live, it is not public etc).
    if (msg) {
      return null;
    }

    // All checks passed, return video stream url.
    return site.videoStream;
  }

  async getContactInformation(siteId: number) {
    const { contactInformation } = await getSite(
      siteId,
      this.sitesRepository,
      undefined,
      true,
    );

    return { contactInformation };
  }
}
