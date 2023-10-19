import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Site } from 'sites/sites.entity';
import { Repository } from 'typeorm';
import { User } from 'users/users.entity';
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

  async getMonitoringStats({
    metric,
    siteId,
    userId,
    spotterId,
    start,
    end,
  }: GetMonitoringStatsDto) {
    if (start && end && start.toISOString() > end.toISOString()) {
      throw new BadRequestException(
        `Invalid Dates: start date can't be after end date`,
      );
    }
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

    const { startDate, endDate } = getDefaultDates(
      start?.toISOString(),
      end?.toISOString(),
    );

    const query = this.monitoringRepository
      .createQueryBuilder('monitoring')
      .select('metric')
      .addSelect('timestamp')
      .addSelect('user_id')
      .addSelect('site_id');

    const withStartDate = startDate
      ? query.andWhere('timestamp >= :startDate', { startDate })
      : query;

    const withEndDate = endDate
      ? withStartDate.andWhere('timestamp <= :endDate', { endDate })
      : withStartDate;

    const withMetric = metric
      ? withEndDate.andWhere('metric = :metric', { metric })
      : withEndDate;

    const withUser = userId
      ? withMetric.andWhere('user_id = :userId', { userId })
      : withMetric;

    const withSite = querySiteId
      ? withUser.andWhere('site_id = :querySiteId', { querySiteId })
      : withUser;

    return withSite.orderBy('timestamp', 'DESC').getRawMany();
  }
}
