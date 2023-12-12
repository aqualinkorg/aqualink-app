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
import { IsNull, Not, Repository } from 'typeorm';
import { AdminLevel, User } from 'users/users.entity';
import { getDefaultDates } from 'utils/dates';
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

@Injectable()
export class MonitoringService {
  constructor(
    @InjectRepository(Monitoring)
    private monitoringRepository: Repository<Monitoring>,

    @InjectRepository(Site)
    private siteRepository: Repository<Site>,

    @InjectRepository(Survey)
    private surveyRepository: Repository<Survey>,
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
      throw new BadRequestException('Invalid parameter: spotterId');
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
      .addSelect('COUNT(sm.id)::int', 'surveyMediaNum')
      .leftJoin('site', 's', 'survey.site_id = s.id')
      .leftJoin('users', 'u', 'survey.user_id = u.id')
      .leftJoin('survey_media', 'sm', 'sm.survey_id = survey.id')
      .groupBy(
        'survey.site_id, survey.id, survey.dive_date, survey.updated_at, s.id, s.name, u.email, u.full_name',
      )
      .getRawMany();
  }
}
