import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Site } from 'sites/sites.entity';
import { Repository } from 'typeorm';
import { AdminLevel, User } from 'users/users.entity';
import { getDefaultDates } from 'utils/dates';
import { GetMonitoringStatsDto } from './dto/get-monitoring-stats.dto';
import { PostMonitoringMetricDto } from './dto/post-monitoring-metric.dto';
import { Monitoring } from './monitoring.entity';

@Injectable()
export class MonitoringService {
  constructor(
    @InjectRepository(Monitoring)
    private monitoringRepository: Repository<Monitoring>,

    @InjectRepository(Site)
    private siteRepository: Repository<Site>,
  ) {}

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
    { siteId, spotterId, monthly, start, end }: GetMonitoringStatsDto,
    user: User,
  ) {
    if (siteId && spotterId) {
      throw new BadRequestException(
        'Invalid parameters: Only one of siteId or spotterId can be set, not both',
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

    const querySiteId = siteId || spotterSite?.id;

    if (user.adminLevel === AdminLevel.SiteManager) {
      if (!querySiteId)
        throw new BadRequestException('Site ID or spotter Id not provided');

      const isSiteAdmin = await this.siteRepository
        .createQueryBuilder('site')
        .innerJoin('site.admins', 'admins', 'admins.id = :userId', {
          userId: user.id,
        })
        .andWhere('site.id = :querySiteId', { querySiteId })
        .getOne();

      if (!isSiteAdmin) throw new ForbiddenException();
    }
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

    const query = this.monitoringRepository
      .createQueryBuilder('monitoring')
      .select('monitoring.site_id', 'siteId')
      .addSelect('s.name', 'siteName')
      .addSelect(
        `date_trunc('${aggregationPeriod}', monitoring."timestamp")`,
        'date',
      )
      .addSelect('COUNT(*)::int', 'totalRequests')
      .addSelect('COUNT(monitoring.user_id)::int', 'registeredUserRequests')
      .addSelect('COUNT(uass.users_id)::int', 'siteAdminRequests')
      .addSelect(
        `SUM(CASE WHEN monitoring.metric = 'time_series_request' THEN 1 ELSE 0 END)::int`,
        'timeSeriesRequests',
      )
      .addSelect(
        `SUM(CASE WHEN monitoring.metric = 'csv_download' THEN 1 ELSE 0 END)::int`,
        'CSVDownloadRequests',
      )
      .innerJoin('site', 's', 'monitoring.site_id = s.id')
      .leftJoin(
        'users_administered_sites_site',
        'uass',
        'monitoring.site_id = uass.site_id  AND monitoring.user_id = uass.users_id',
      );

    const withStartDate = startDate
      ? query.andWhere('monitoring."timestamp" >= :startDate', { startDate })
      : query;

    const withEndDate = endDate
      ? withStartDate.andWhere('monitoring."timestamp" <= :endDate', {
          endDate,
        })
      : withStartDate;

    const withSite = querySiteId
      ? withEndDate.andWhere('monitoring.site_id = :querySiteId', {
          querySiteId,
        })
      : withEndDate;

    const result = await withSite
      .groupBy('monitoring.site_id, s.name, date')
      .orderBy('monitoring.site_id, date')
      .getRawMany();

    return result;
  }
}
