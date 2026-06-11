import _, { camelCase } from 'lodash';
import { Repository } from 'typeorm';
import { DynamicCollection } from '../collections/collections.entity';
import { CollectionDataDto } from '../collections/dto/collection-data.dto';
import { Site } from '../sites/sites.entity';
import { SourceType } from '../sites/schemas/source-type.enum';
import { LatestData } from '../time-series/latest-data.entity';

export const getCollectionData = async (
  sites: Site[],
  latestDataRepository: Repository<LatestData>,
  options?: { at?: Date },
): Promise<Record<number, CollectionDataDto>> => {
  const siteIds = sites.map((site) => site.id);

  if (!siteIds.length) {
    return {};
  }

  // If an "at" date is provided, query time_series historical data at that timestamp;
  // otherwise, use the materialized latest_data view for performance.
  const until = options?.at;

  if (!until) {
    const latestData: LatestData[] = await latestDataRepository
      .createQueryBuilder('latest_data')
      .select('id')
      .addSelect('timestamp')
      .addSelect('value')
      .addSelect('site_id', 'siteId')
      .addSelect('survey_point_id', 'surveyPointId')
      .addSelect('metric')
      .addSelect('source')
      .where('site_id IN (:...siteIds)', { siteIds })
      .andWhere('source != :hoboSource', { hoboSource: SourceType.HOBO })
      .getRawMany();

    return _(latestData)
      .groupBy((o) => o.siteId)
      .mapValues<CollectionDataDto>((data) =>
        data.reduce<CollectionDataDto>(
          (acc, siteData): CollectionDataDto => ({
            ...acc,
            [camelCase(siteData.metric)]: siteData.value,
          }),
          {},
        ),
      )
      .toJSON();
  }

  // Historical lookups are latency-sensitive against the shared remote DB.
  // A lateral join performs one indexed lookup per site, which is much faster
  // than sorting all matching daily_data rows and then applying DISTINCT ON.
  const rows = await latestDataRepository.manager.query(
    `
      SELECT
        s.id AS "siteId",
        dd.date AS "timestamp",
        dd.degree_heating_days AS "degreeHeatingDays",
        dd.satellite_temperature AS "satelliteTemperature",
        dd.daily_alert_level AS "dailyAlertLevel",
        dd.weekly_alert_level AS "weeklyAlertLevel"
      FROM site s
      LEFT JOIN LATERAL (
        SELECT
          date,
          degree_heating_days,
          satellite_temperature,
          daily_alert_level,
          weekly_alert_level
        FROM daily_data dd
        WHERE dd.site_id = s.id
          AND dd.date <= $2
        ORDER BY dd.date DESC
        LIMIT 1
      ) dd ON true
      WHERE s.id = ANY($1::int[])
    `,
    [siteIds, until],
  );

  return rows.reduce(
    (acc, row) => ({
      ...acc,
      [row.siteId]: {
        dhw: row.degreeHeatingDays,
        satelliteTemperature: row.satelliteTemperature,
        tempAlert: row.dailyAlertLevel,
        tempWeeklyAlert: row.weeklyAlertLevel,
      },
    }),
    {} as Record<number, CollectionDataDto>,
  );
};

export const heatStressTracker: DynamicCollection = {
  name: 'Heat Stress Tracker',
  sites: [],
  siteIds: [],
  isPublic: true,
};
