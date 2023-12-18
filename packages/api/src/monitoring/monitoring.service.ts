import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DateTime } from 'luxon';
import { Site } from 'sites/sites.entity';
import { Survey } from 'surveys/surveys.entity';
import { LatestData } from 'time-series/latest-data.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { AdminLevel, User } from 'users/users.entity';
import { getDefaultDates } from 'utils/dates';
import { GetSitesOverviewDto } from './dto/get-sites-overview.dto';
import { GetMonitoringStatsDto } from './dto/get-monitoring-stats.dto';
import { PostMonitoringMetricDto } from './dto/post-monitoring-metric.dto';
import { Monitoring } from './monitoring.entity';

interface GetMetricsForSitesProps {
  siteIds: number[];
  skipAdminCheck: boolean;
  user?: User;
  aggregationPeriod?: 'week' | 'month';
  startDate?: Date;
  endDate?: Date;
}

function escapeLikeString(raw: string): string {
  return raw.replace(/[\\%_]/g, '\\$&');
}

@Injectable()
export class MonitoringService {
  constructor(
    @InjectRepository(Monitoring)
    private monitoringRepository: Repository<Monitoring>,

    @InjectRepository(Site)
    private siteRepository: Repository<Site>,

    @InjectRepository(Survey)
    private surveyRepository: Repository<Survey>,

    @InjectRepository(LatestData)
    private latestDataRepository: Repository<LatestData>,
  ) {}

  private async getMetricsForSites({
    siteIds,
    skipAdminCheck,
    user,
    aggregationPeriod,
    startDate,
    endDate,
  }: GetMetricsForSitesProps) {
    return Promise.all(
      siteIds.map(async (querySiteId) => {
        if (!skipAdminCheck) {
          // this should never occur
          if (!user) throw new InternalServerErrorException('');

          if (user.adminLevel === AdminLevel.SiteManager) {
            const isSiteAdmin = await this.siteRepository
              .createQueryBuilder('site')
              .innerJoin('site.admins', 'admins', 'admins.id = :userId', {
                userId: user.id,
              })
              .andWhere('site.id = :querySiteId', { querySiteId })
              .getOne();

            if (!isSiteAdmin) throw new ForbiddenException();
          }
        }

        const queryBase =
          this.monitoringRepository.createQueryBuilder('monitoring');

        const withAggregate = aggregationPeriod
          ? queryBase.select(
              `date_trunc('${aggregationPeriod}', monitoring."timestamp")`,
              'date',
            )
          : queryBase.select('monitoring.site_id', 'siteId');

        withAggregate
          .addSelect(
            'SUM(CASE WHEN user_id IS NULL THEN 1 ELSE 0 END)::int',
            'totalRequests',
          )
          .addSelect('COUNT(monitoring.user_id)::int', 'registeredUserRequests')
          .addSelect('COUNT(uass.users_id)::int', 'siteAdminRequests')
          .addSelect(
            `SUM(CASE WHEN monitoring.metric = 'time_series_request' AND user_id IS NULL THEN 1 ELSE 0 END)::int`,
            'timeSeriesRequests',
          )
          .addSelect(
            `SUM(CASE WHEN monitoring.metric = 'csv_download' AND user_id IS NULL THEN 1 ELSE 0 END)::int`,
            'CSVDownloadRequests',
          )
          .innerJoin('site', 's', 'monitoring.site_id = s.id')
          .leftJoin(
            'users_administered_sites_site',
            'uass',
            'monitoring.site_id = uass.site_id  AND monitoring.user_id = uass.users_id',
          )
          .andWhere('monitoring.site_id = :querySiteId', {
            querySiteId,
          });

        const withStartDate = startDate
          ? withAggregate.andWhere('monitoring."timestamp" >= :startDate', {
              startDate,
            })
          : withAggregate;

        const withEndDate = endDate
          ? withStartDate.andWhere('monitoring."timestamp" <= :endDate', {
              endDate,
            })
          : withStartDate;

        const groupAndOrderBy = aggregationPeriod
          ? 'monitoring.site_id, date'
          : 'monitoring.site_id';

        const [metrics, site] = await Promise.all([
          withEndDate
            .groupBy(groupAndOrderBy)
            .orderBy(groupAndOrderBy)
            .getRawMany(),
          this.siteRepository.findOne({
            where: { id: querySiteId },
          }),
        ]);

        // This should never happen since we validate siteIds
        if (!site) throw new InternalServerErrorException();

        return { siteId: site.id, siteName: site.name, data: metrics };
      }),
    );
  }

  async postMonitoringMetric(
    { metric, siteId }: PostMonitoringMetricDto,
    user: User,
  ): Promise<void> {
    await this.monitoringRepository.save({
      metric,
      user,
      site: { id: siteId },
    });
  }

  async getMonitoringStats(
    { siteIds, spotterId, monthly, start, end }: GetMonitoringStatsDto,
    user: User,
  ) {
    if (siteIds && spotterId) {
      throw new BadRequestException(
        'Invalid parameters: Only one of siteIds or spotterId can be provided, not both',
      );
    }

    if (!siteIds?.length && !spotterId) {
      throw new BadRequestException(
        'Invalid parameters: One of siteIds or spotterId must be provided',
      );
    }

    const spotterSite = spotterId
      ? await this.siteRepository.findOne({
          where: { sensorId: spotterId },
        })
      : null;

    if (spotterSite === null && spotterId) {
      throw new BadRequestException('Invalid value for parameter: spotterId');
    }

    const querySiteIds = siteIds || [spotterSite!.id];

    if (start && end && start.toISOString() > end.toISOString()) {
      throw new BadRequestException(
        `Invalid Dates: start date can't be after end date`,
      );
    }

    const { startDate, endDate } = getDefaultDates(
      start?.toISOString(),
      end?.toISOString(),
    );

    const aggregationPeriod = monthly ? 'month' : 'week';

    return this.getMetricsForSites({
      siteIds: querySiteIds,
      skipAdminCheck: false,
      user,
      aggregationPeriod,
      startDate,
      endDate,
    });
  }

  async getMonitoringLastMonth() {
    const prevMonth = DateTime.now().minus({ month: 1 }).toJSDate();
    const sitesWithSpotter = await this.siteRepository.find({
      where: { sensorId: Not(IsNull()) },
      select: ['id'],
    });
    return this.getMetricsForSites({
      siteIds: sitesWithSpotter.map((x) => x.id),
      skipAdminCheck: true,
      user: undefined,
      aggregationPeriod: undefined,
      startDate: prevMonth,
      endDate: undefined,
    });
  }

  surveysReport() {
    return this.surveyRepository
      .createQueryBuilder('survey')
      .select('survey.site_id', 'siteId')
      .addSelect('survey.id', 'surveyId')
      .addSelect('survey.dive_date', 'diveDate')
      .addSelect('survey.updated_at', 'updatedAt')
      .addSelect('s.name', 'siteName')
      .addSelect('u.email', 'userEmail')
      .addSelect('u.full_name', 'userFullName')
      .addSelect('COUNT(sm.id)::int', 'surveyMediaCount')
      .leftJoin('site', 's', 'survey.site_id = s.id')
      .leftJoin('users', 'u', 'survey.user_id = u.id')
      .leftJoin('survey_media', 'sm', 'sm.survey_id = survey.id')
      .groupBy(
        'survey.site_id, survey.id, survey.dive_date, survey.updated_at, s.id, s.name, u.email, u.full_name',
      )
      .getRawMany();
  }

  SitesOverview({
    siteId,
    siteName,
    spotterId,
    adminEmail,
    adminUsername,
    organization,
    status,
  }: GetSitesOverviewDto) {
    const latestDataSubQuery = this.latestDataRepository
      .createQueryBuilder('latest_data')
      .select(
        'DISTINCT ON (latest_data.site_id) latest_data.site_id, latest_data.timestamp',
      )
      .where(`latest_data.source = 'spotter'`)
      .orderBy('latest_data.site_id')
      .addOrderBy('latest_data.timestamp', 'DESC');

    const surveysCountSubQuery = this.surveyRepository
      .createQueryBuilder('survey')
      .select('survey.site_id', 'site_id')
      .addSelect('COUNT(*)', 'count')
      .groupBy('survey.site_id');

    const baseQuery = this.siteRepository
      .createQueryBuilder('site')
      .select('site.id', 'siteId')
      .addSelect('site.name', 'siteName')
      .addSelect('ARRAY_AGG(u.organization)', 'organizations')
      .addSelect('ARRAY_AGG(u.full_name)', 'adminNames')
      .addSelect('ARRAY_AGG(u.email)', 'adminEmails')
      .addSelect('site.status', 'status')
      .addSelect('site.depth', 'depth')
      .addSelect('site.sensor_id', 'spotterId')
      .addSelect('site.video_stream', 'videoStream')
      .addSelect('site.updated_at', 'updatedAt')
      .addSelect('latest_data.timestamp', 'lastDataReceived')
      .addSelect('COALESCE(surveys_count.count, 0)', 'surveysCount')
      .addSelect('site.contact_information', 'contactInformation')
      .addSelect('site.created_at', 'createdAt')
      .leftJoin(
        'users_administered_sites_site',
        'uass',
        'uass.site_id = site.id',
      )
      .leftJoin('users', 'u', 'uass.users_id = u.id')
      .leftJoin(
        `(${latestDataSubQuery.getQuery()})`,
        'latest_data',
        'latest_data.site_id = site.id',
      )
      .leftJoin(
        `(${surveysCountSubQuery.getQuery()})`,
        'surveys_count',
        'surveys_count.site_id = site.id',
      );

    const withSiteId = siteId
      ? baseQuery.andWhere('site.id = :siteId', { siteId })
      : baseQuery;

    const withSiteName = siteName
      ? withSiteId.andWhere('site.name ILIKE :siteName', {
          siteName: `%${escapeLikeString(siteName)}%`,
        })
      : withSiteId;

    const withSpotterId = spotterId
      ? withSiteName.andWhere('site.sensor_id = :spotterId', { spotterId })
      : withSiteName;

    const withAdminEmail = adminEmail
      ? withSpotterId.andWhere('u.email ILIKE :adminEmail', {
          adminEmail: `%${escapeLikeString(adminEmail)}%`,
        })
      : withSpotterId;

    const withAdminUserName = adminUsername
      ? withAdminEmail.andWhere('u.full_name ILIKE :adminUsername', {
          adminUsername: `%${escapeLikeString(adminUsername)}%`,
        })
      : withAdminEmail;

    const withOrganization = organization
      ? withAdminUserName.andWhere('u.organization ILIKE :organization', {
          organization: `%${escapeLikeString(organization)}%`,
        })
      : withAdminUserName;

    const withStatus = status
      ? withOrganization.andWhere('site.status = :status', { status })
      : withOrganization;

    const ret = withStatus
      .groupBy('site.id')
      .addGroupBy('site.name')
      .addGroupBy('site.status')
      .addGroupBy('site.depth')
      .addGroupBy('site.sensor_id')
      .addGroupBy('site.video_stream')
      .addGroupBy('site.updated_at')
      .addGroupBy('latest_data.timestamp')
      .addGroupBy('surveys_count.count')
      .addGroupBy('site.contact_information');

    return ret.getRawMany();
  }

  getSitesStatus() {
    return this.siteRepository
      .createQueryBuilder('site')
      .select('COUNT(*)', 'totalSites')
      .addSelect("COUNT(*) FILTER (WHERE site.status = 'deployed')", 'deployed')
      .addSelect('COUNT(*) FILTER (WHERE site.display)', 'displayed')
      .addSelect(
        "COUNT(*) FILTER (WHERE site.status = 'maintenance')",
        'maintenance',
      )
      .addSelect("COUNT(*) FILTER (WHERE site.status = 'shipped')", 'shipped')
      .addSelect(
        "COUNT(*) FILTER (WHERE site.status = 'end_of_life')",
        'endOfLife',
      )
      .addSelect("COUNT(*) FILTER (WHERE site.status = 'lost')", 'lost')
      .getRawOne();
  }
}
