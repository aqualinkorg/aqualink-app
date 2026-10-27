import { BadRequestException } from '@nestjs/common';
import { DateTime } from 'luxon';
import { Repository } from 'typeorm';
import { CollectionDataDto } from '../collections/dto/collection-data.dto';
import { DailyData } from '../sites/daily-data.entity';

export interface HistoricalDay {
  date: string;
  start: Date;
  end: Date;
}

export function parseHistoricalDay(date?: string): HistoricalDay | undefined {
  if (date === undefined) return undefined;

  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new BadRequestException('Date must be a valid YYYY-MM-DD UTC date');
  }
  const day = DateTime.fromISO(date, { zone: 'UTC' });
  if (!day.isValid || day.year < 1 || day.toISODate() !== date) {
    throw new BadRequestException('Date must be a valid YYYY-MM-DD UTC date');
  }
  if (day > DateTime.utc().startOf('day')) {
    throw new BadRequestException('Date must not be in the future');
  }
  return {
    date,
    start: day.toJSDate(),
    end: day.plus({ days: 1 }).toJSDate(),
  };
}

interface DailySnapshotRow {
  siteId: number;
  observedAt: Date;
  satelliteTemperature: number | null;
  degreeHeatingDays: number | null;
  dailyAlertLevel: number | null;
  weeklyAlertLevel: number | null;
}

export interface HistoricalSnapshot {
  collectionData: CollectionDataDto;
  observedAt: string;
}

/** Read all requested sites in one query, without falling back to another day. */
export async function getHistoricalSiteData(
  siteIds: number[],
  day: HistoricalDay,
  dailyDataRepository: Repository<DailyData>,
): Promise<Record<number, HistoricalSnapshot>> {
  if (!siteIds.length) return {};

  const rows = await dailyDataRepository
    .createQueryBuilder('daily_data')
    .select('daily_data.site_id', 'siteId')
    .addSelect('daily_data.date', 'observedAt')
    .addSelect('daily_data.satellite_temperature', 'satelliteTemperature')
    .addSelect('daily_data.degree_heating_days', 'degreeHeatingDays')
    .addSelect('daily_data.daily_alert_level', 'dailyAlertLevel')
    .addSelect('daily_data.weekly_alert_level', 'weeklyAlertLevel')
    .distinctOn(['daily_data.site_id'])
    .where('daily_data.site_id IN (:...siteIds)', { siteIds })
    .andWhere('daily_data.date >= :start', { start: day.start })
    .andWhere('daily_data.date < :end', { end: day.end })
    .orderBy('daily_data.site_id', 'ASC')
    .addOrderBy('daily_data.date', 'DESC')
    .addOrderBy('daily_data.id', 'DESC')
    .getRawMany<DailySnapshotRow>();

  return Object.fromEntries(
    rows.map((row) => [
      row.siteId,
      {
        observedAt: row.observedAt.toISOString(),
        collectionData: {
          ...(row.satelliteTemperature !== null && {
            satelliteTemperature: row.satelliteTemperature,
          }),
          ...(row.degreeHeatingDays !== null && {
            dhw: row.degreeHeatingDays / 7,
          }),
          ...(row.dailyAlertLevel !== null && {
            tempAlert: row.dailyAlertLevel,
          }),
          ...(row.weeklyAlertLevel !== null && {
            tempWeeklyAlert: row.weeklyAlertLevel,
          }),
        },
      },
    ]),
  );
}
