import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository, SelectQueryBuilder, UpdateResult } from 'typeorm';
import { omit } from 'lodash';
import Bluebird from 'bluebird';
import { sanitizeUrl } from '@braintree/sanitize-url';
import { ReefCheckSurvey } from 'reef-check-surveys/reef-check-surveys.entity';
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
  getWaterQualityDataSubQuery,
  getLatestData,
  getSite,
  createSite,
  getReefCheckDataSubQuery,
} from '../utils/site.utils';
import { getSpotterData, sofarLatest } from '../utils/sofar';
import { SofarLatestData } from '../utils/sofar.types';
import { ExclusionDates } from './exclusion-dates.entity';
import { DeploySpotterDto } from './dto/deploy-spotter.dto';
import { ExcludeSpotterDatesDto } from './dto/exclude-spotter-dates.dto';
import { backfillSiteData } from '../workers/backfill-site-data';
import { SiteApplication } from '../site-applications/site-applications.entity';
import { createPoint } from '../utils/coordinates';
import { Sources } from './sources.entity';
import {
  getCollectionData,
  getHistoricalCollectionData,
} from '../utils/collections.utils';
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

type SiteId = Site['id'];
type AdminIdList = SiteId[];
type OptionalDateQuery = FilterSiteDto['date'];
type OptionalIframeUrl = Site['iframe'] | undefined;

const SITE_DETAIL_RELATIONS = [
  'region',
  'admins',
  'historicalMonthlyMean',
  'siteApplication',
  'sketchFab',
  'reefCheckSurveys',
  'reefCheckSites',
];

const TRUSTED_IFRAME_HOSTS = new Set(['aqualink.org']);
const EXCLUSION_DATE_FORMAT = 'LL/dd/yyyy HH:mm';

interface ExclusionSourceContext {
  source: Sources;
  range: ExcludeSpotterDatesDto;
}

const ensureSuperAdminForProtectedFields = (
  dto: UpdateSiteDto,
  user: User,
): void => {
  const touchesProtectedField = Boolean(
    dto.display || dto.status || dto.videoStream || dto.contactInformation,
  );
  if (touchesProtectedField && user.adminLevel !== AdminLevel.SuperAdmin) {
    throw new ForbiddenException();
  }
};

const ensureSiteAffected = (result: UpdateResult, id: SiteId): void => {
  if (!result.affected) {
    throw new NotFoundException(`Site with ID ${id} not found.`);
  }
};

const validateIframeUrlObject = (iframeAsURL: URL): void => {
  if (iframeAsURL.protocol !== 'https:') {
    throw new Error('Invalid protocol');
  }
  if (iframeAsURL.port !== '') {
    throw new Error('Invalid port');
  }
  if (!TRUSTED_IFRAME_HOSTS.has(iframeAsURL.hostname)) {
    throw new Error('Invalid hostname');
  }
};

const validateOptionalIsoDate = (dateValue?: OptionalDateQuery): void => {
  if (dateValue && !DateTime.fromISO(dateValue).isValid) {
    throw new BadRequestException('Start or end is not a valid date');
  }
};

const formatSpotterTrackResponse = (
  site: Site,
  spotterLatest?: SofarLatestData,
) => {
  const isDeployed = site.status === SiteStatus.Deployed;
  if (!spotterLatest) {
    return {
      isDeployed: false,
      timestamp: undefined,
      position: undefined,
    };
  }

  const lastTrack = spotterLatest.track?.[spotterLatest.track.length - 1];
  if (!lastTrack) {
    return {
      isDeployed,
      timestamp: undefined,
    };
  }

  return {
    isDeployed,
    timestamp: lastTrack.timestamp,
    position: {
      longitude: lastTrack.longitude,
      latitude: lastTrack.latitude,
    },
  };
};

const applySiteFilterPredicates = (
  query: SelectQueryBuilder<Site>,
  filter: FilterSiteDto,
): void => {
  if (filter.name) {
    query.andWhere('(lower(site.name) LIKE :name)', {
      name: `%${filter.name.toLowerCase()}%`,
    });
  }
  if (filter.status) {
    query.andWhere('site.status = :status', { status: filter.status });
  }
  if (filter.regionId) {
    query.andWhere('site.region = :region', { region: filter.regionId });
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
};

const buildSiteDetailResponse = (
  site: Site,
  enrichment: {
    videoStream: Site['videoStream'];
    collectionData: Site['collectionData'];
  },
): Site => ({
  id: site.id,
  name: site.name,
  sensorId: site.sensorId,
  reefCheckSurveys: site.reefCheckSurveys ?? [],
  reefCheckSites: site.reefCheckSites ?? [],
  polygon: site.polygon,
  nearestNOAALocation: site.nearestNOAALocation,
  depth: site.depth,
  iframe: site.iframe,
  status: site.status,
  maxMonthlyMean: site.maxMonthlyMean,
  timezone: site.timezone,
  display: site.display,
  createdAt: site.createdAt,
  updatedAt: site.updatedAt,
  region: site.region,
  admins: site.admins,
  siteApplication: site.siteApplication,
  sketchFab: site.sketchFab,
  maskedSpotterApiToken: site.spotterApiToken
    ? `****${site.spotterApiToken.slice(-4)}`
    : undefined,
  surveys: site.surveys || [],
  historicalMonthlyMean: site.historicalMonthlyMean || [],
  videoStream: enrichment.videoStream,
  applied: site.applied,
  collectionData: enrichment.collectionData,
});

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

    @InjectRepository(ReefCheckSurvey)
    private reefCheckSurveyRepository: Repository<ReefCheckSurvey>,

    @InjectDataSource() private dataSource: DataSource,
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

    backfillSiteData({ dataSource: this.dataSource, siteId: site.id });
    await this.scheduledUpdateRepository.save({ site: { id: site.id } });
    await this.notifySiteCreated(site, user);

    return this.siteApplicationRepository.save({
      ...appParams,
      site,
      user,
    });
  }

  async find(filter: FilterSiteDto): Promise<Site[]> {
    const query = this.sitesRepository.createQueryBuilder('site');
    applySiteFilterPredicates(query, filter);

    const res = await query
      .leftJoinAndSelect('site.region', 'region')
      .leftJoinAndSelect('site.sketchFab', 'sketchFab')
      .leftJoinAndSelect('site.admins', 'admins')
      .leftJoinAndSelect('site.reefCheckSites', 'reefCheckSites')
      .andWhere('display = true')
      .getMany();

    const [
      mappedSiteData,
      hasHoboDataSet,
      waterQualityDataSet,
      reefCheckDataSet,
    ] = await Promise.all([
      this.resolveSiteCollectionData(res, filter.date),
      hasHoboDataSubQuery(this.sourceRepository),
      getWaterQualityDataSubQuery(this.latestDataRepository),
      getReefCheckDataSubQuery(this.reefCheckSurveyRepository),
    ]);

    return res.map((site) => ({
      ...site,
      applied: site.applied,
      collectionData: mappedSiteData[site.id],
      hasHobo: hasHoboDataSet.has(site.id),
      waterQualitySources: waterQualityDataSet.get(site.id),
      reefCheckData: reefCheckDataSet[site.id],
    }));
  }

  async findOne(id: SiteId, date?: OptionalDateQuery): Promise<Site> {
    const site = await getSite(
      id,
      this.sitesRepository,
      SITE_DETAIL_RELATIONS,
      true,
    );

    const [videoStream, mappedSiteData] = await Promise.all([
      this.checkVideoStream(site),
      this.resolveSiteCollectionData([site], date),
    ]);

    return buildSiteDetailResponse(site, {
      videoStream,
      collectionData: mappedSiteData[site.id],
    });
  }

  private resolveSiteCollectionData(sites: Site[], date?: OptionalDateQuery) {
    if (date) {
      return getHistoricalCollectionData(sites, {
        dailyDataRepository: this.dailyDataRepository,
        date,
      });
    }
    return getCollectionData(sites, this.latestDataRepository);
  }

  private async notifySiteCreated(site: Site, user: User): Promise<void> {
    const regionWarningMessage = !site.region
      ? '\n:warning: *Warning*: No region was found for this site, please ask devs to enter one manually.'
      : '';
    const messageTemplate: SlackMessage = {
      channel: process.env.SLACK_BOT_CHANNEL as string,
      text: `New site ${site.name} created with id=${site.id}, by ${user.fullName}${regionWarningMessage}`,
      mrkdwn: true,
    };
    await sendSlackMessage(
      messageTemplate,
      process.env.SLACK_BOT_TOKEN as string,
    );
  }

  private checkIframeURL(iframe: OptionalIframeUrl): OptionalIframeUrl {
    if (!iframe) return undefined;
    const sanitizedIframeURL = sanitizeUrl(iframe);

    try {
      validateIframeUrlObject(new URL(sanitizedIframeURL));
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }

    return sanitizedIframeURL;
  }

  private buildUpdatePayload(dto: UpdateSiteDto) {
    const { coordinates, regionId, iframe } = dto;
    const checkedIframe = this.checkIframeURL(iframe);

    return {
      ...omit(dto, ['adminIds', 'coordinates', 'regionId']),
      ...(regionId !== undefined ? { region: { id: regionId } } : {}),
      ...(coordinates
        ? { polygon: createPoint(coordinates.longitude, coordinates.latitude) }
        : {}),
      ...(checkedIframe ? { iframe: checkedIframe } : {}),
    };
  }

  async update(
    id: SiteId,
    updateSiteDto: UpdateSiteDto,
    user: User,
  ): Promise<Site> {
    const dto = updateSiteDto ?? ({} as UpdateSiteDto);
    ensureSuperAdminForProtectedFields(dto, user);

    const result = await this.sitesRepository
      .update(id, this.buildUpdatePayload(dto))
      .catch(handleDuplicateSite);

    if (dto.coordinates) {
      this.scheduledUpdateRepository.save({ site: { id } });
    }
    if (dto.adminIds) {
      await this.updateAdmins(id, dto.adminIds);
    }
    ensureSiteAffected(result, id);

    const updated = await this.sitesRepository.findOne({
      where: { id },
      relations: ['admins'],
    });

    return updated!;
  }

  async delete(id: SiteId): Promise<void> {
    const result = await this.sitesRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Site with ID ${id} not found.`);
    }
  }

  async findDailyData(
    id: SiteId,
    start?: OptionalDateQuery,
    end?: OptionalDateQuery,
  ): Promise<DailyData[]> {
    await getSite(id, this.sitesRepository);
    validateOptionalIsoDate(start);
    validateOptionalIsoDate(end);

    return this.dailyDataRepository
      .createQueryBuilder('daily_data')
      .where('site_id = :id', { id })
      .orderBy('date', 'DESC')
      .andWhere('date <= :endDate', {
        endDate: end ? new Date(end) : new Date(),
      })
      .andWhere('date >= :startDate', {
        startDate: new Date(start || 0),
      })
      .limit(start && end ? undefined : 90)
      .getMany();
  }

  async findSpotterPosition(id: SiteId) {
    const site = await getSite(
      id,
      this.sitesRepository,
      ['historicalMonthlyMean'],
      true,
    );

    if (!site.sensorId) {
      return {
        timestamp: undefined,
        isDeployed: site.status === SiteStatus.Deployed,
        position: undefined,
      };
    }

    const sofarToken = site.spotterApiToken || process.env.SOFAR_API_TOKEN;
    const spotterLatest = await sofarLatest({
      sensorId: site.sensorId,
      token: sofarToken,
    });

    return formatSpotterTrackResponse(site, spotterLatest);
  }

  async findLatestData(id: SiteId): Promise<LatestData[]> {
    const site = await getSite(id, this.sitesRepository, [
      'historicalMonthlyMean',
    ]);

    return getLatestData(site, this.latestDataRepository);
  }

  async getSpotterData(
    id: SiteId,
    start?: OptionalDateQuery,
    end?: OptionalDateQuery,
  ) {
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

  async deploySpotter(id: SiteId, deploySpotterDto: DeploySpotterDto) {
    const site = await getSite(id, this.sitesRepository);
    const { endDate } = deploySpotterDto ?? ({} as DeploySpotterDto);

    if (endDate == null) {
      throw new BadRequestException('endDate must be provided');
    }
    if (!site.sensorId) {
      throw new BadRequestException(`Site with ID ${id} has no spotter`);
    }
    if (site.status === SiteStatus.Deployed) {
      throw new BadRequestException(`Site with ID ${id} is already deployed`);
    }

    await Promise.all([
      this.sitesRepository.update(id, { status: SiteStatus.Deployed }),
      this.exclusionDatesRepository.save({
        sensorId: site.sensorId,
        endDate,
      }),
    ]);
  }

  private async applySourceExclusionWindow(
    siteId: SiteId,
    context: ExclusionSourceContext,
  ): Promise<void> {
    const { source, range } = context;
    const { startDate, endDate } = range;

    this.logger.log(
      `Deleting time-series data for ${source.type} sensor ${source.sensorId} ; site ${siteId}`,
    );

    const alreadyExists = await this.exclusionDatesRepository.findOne({
      where: { sensorId: source.sensorId!, startDate, endDate },
    });

    if (alreadyExists) {
      throw new ConflictException(
        `Exclusion period [${DateTime.fromJSDate(startDate).toFormat(
          EXCLUSION_DATE_FORMAT,
        )}, ${DateTime.fromJSDate(endDate).toFormat(
          EXCLUSION_DATE_FORMAT,
        )}] already exists for sensor ${source.sensorId}.`,
      );
    }

    await this.exclusionDatesRepository.save({
      sensorId: source.sensorId!,
      endDate,
      startDate,
    });

    await this.timeSeriesRepository
      .createQueryBuilder('time-series')
      .where('source_id = :id', { id: source.id })
      .andWhere('timestamp <= :endDate', { endDate: new Date(endDate) })
      .andWhere('timestamp >= :startDate', { startDate: new Date(startDate) })
      .delete()
      .execute();
  }

  async addExclusionDates(
    id: SiteId,
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

    const sources = await this.sourceRepository.find({
      where: [
        { site: { id: site.id }, type: SourceType.SPOTTER },
        { site: { id: site.id }, type: SourceType.SEAPHOX },
      ],
    });
    const sourcesWithSensor = sources.filter((source) => source.sensorId);

    if (sourcesWithSensor.length === 0) {
      throw new BadRequestException(`Site with ID ${id} has no sensor`);
    }

    await Bluebird.Promise.each(sourcesWithSensor, (source) =>
      this.applySourceExclusionWindow(site.id, {
        source,
        range: excludeSpotterDatesDto,
      }),
    );
  }

  async getExclusionDates(id: SiteId) {
    const site = await getSite(id, this.sitesRepository);

    if (!site.sensorId) {
      throw new BadRequestException(`Site with ID ${id} has no spotter`);
    }

    return this.exclusionDatesRepository.find({
      where: { sensorId: site.sensorId },
    });
  }

  private async updateAdmins(id: SiteId, adminIds: AdminIdList) {
    const site = await getSite(id, this.sitesRepository, ['admins']);

    await this.sitesRepository
      .createQueryBuilder('sites')
      .update()
      .relation('admins')
      .of(site)
      .addAndRemove(adminIds, site.admins);
  }

  private async checkVideoStream(site: Site) {
    if (!site.videoStream) {
      return null;
    }

    const isPlaylist = site.videoStream.includes('videoseries');
    const apiKey = process.env.FIREBASE_API_KEY;

    if (!apiKey) {
      this.logger.error('No google api key was defined');
      return null;
    }

    const videoId = getYouTubeVideoId(site.videoStream, isPlaylist);
    if (!videoId) {
      return null;
    }

    const rsp = await fetchVideoDetails([videoId], apiKey, isPlaylist);
    if (!rsp.data.items.length) {
      return null;
    }

    const msg = getErrorMessage(rsp.data.items[0], isPlaylist);
    return msg ? null : site.videoStream;
  }

  async getContactInformation(siteId: SiteId) {
    const { contactInformation } = await getSite(
      siteId,
      this.sitesRepository,
      undefined,
      true,
    );

    return { contactInformation };
  }
}
