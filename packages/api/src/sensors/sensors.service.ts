import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Bluebird from 'bluebird';
import { camelCase, groupBy, keyBy, mapKeys, mapValues } from 'lodash';
import { GeoJSON, Point } from 'geojson';
import { IsNull, Not, Repository } from 'typeorm';
import { Site, SensorType } from '../sites/sites.entity';
import { Survey } from '../surveys/surveys.entity';
import { TimeSeries } from '../time-series/time-series.entity';
import { getAllColumns, getSiteFromSensorId } from '../utils/site.utils';
import { getSpotterData, getLatestData } from '../utils/sofar';
import { createPoint } from '../utils/coordinates';
import { SpotterData } from '../utils/sofar.types';
import {
  TimeSeriesData,
  getDataQuery,
  groupByMetricAndSource,
} from '../utils/time-series.utils';
import { DailyData } from '../sites/daily-data.entity';
import { Sources } from '../sites/sources.entity';
import { SensorDataDto } from './dto/sensor-data.dto';
import { SourceType } from '../sites/schemas/source-type.enum';
import { Metric } from '../time-series/metrics.enum';

@Injectable()
export class SensorsService {
  constructor(
    @InjectRepository(DailyData)
    private dailyDataRepository: Repository<DailyData>,

    @InjectRepository(Site)
    private siteRepository: Repository<Site>,

    @InjectRepository(Sources)
    private sourcesRepository: Repository<Sources>,

    @InjectRepository(Survey)
    private surveyRepository: Repository<Survey>,

    @InjectRepository(TimeSeries)
    private timeSeriesRepository: Repository<TimeSeries>,
  ) {}

  async findSensors(): Promise<
    (Site & { sensorPosition: GeoJSON; sensorType: SensorType })[]
  > {
    const sites = await this.siteRepository.find({
      where: { sensorId: Not(IsNull()) },
      select: getAllColumns(this.siteRepository),
    });

    // Get spotter data and add site id to distinguish them
    const spotterData = await Bluebird.map(
      sites,
      (site) => {
        if (site.sensorId === null) {
          console.warn(`Spotter for site ${site.id} appears null.`);
        }
        const sofarToken = site.spotterApiToken || process.env.SOFAR_API_TOKEN;
        return getSpotterData(site.sensorId!, sofarToken).then((data) => ({
          id: site.id,
          ...data,
        }));
      },
      { concurrency: 10 },
    );

    // Group spotter data by site id for easier search
    const siteIdToSpotterData: Record<number, SpotterData & { id: number }> =
      keyBy(spotterData, (o) => o.id);

    // Construct final response
    return sites.map((site) => {
      const data = siteIdToSpotterData[site.id];
      const longitude = getLatestData(data.longitude)?.value;
      const latitude = getLatestData(data.latitude)?.value;
      const sitePosition = site.polygon as Point;

      const { spotterApiToken, ...rest } = site;

      // If no longitude or latitude is provided by the spotter fallback to the site coordinates
      return {
        ...rest,
        applied: site.applied,
        sensorPosition: createPoint(
          longitude || sitePosition.coordinates[0],
          latitude || sitePosition.coordinates[1],
        ),
        sensorType: SensorType.SofarSpotter,
      };
    });
  }

  async findSensorData(
    sensorId: string,
    metrics: string[],
    startDate?: string,
    endDate?: string,
  ) {
    metrics.forEach((metric) => {
      if (!(Object as any).values(Metric).includes(metric)) {
        throw new BadRequestException(
          `Metrics array must be in the following format: metric1,metric2 where metric is one of ${Object.values(
            Metric,
          )}`,
        );
      }
    });

    const site = await getSiteFromSensorId(sensorId, this.siteRepository);

    const data = await getDataQuery({
      timeSeriesRepository: this.timeSeriesRepository,
      siteId: site.id,
      metrics: metrics as Metric[],
      start: startDate,
      end: endDate,
      hourly: false,
    });

    return groupByMetricAndSource(data);
  }

  async findSensorSurveys(sensorId: string) {
    const site = await getSiteFromSensorId(sensorId, this.siteRepository);

    const surveyDetails = await this.surveyRepository
      .createQueryBuilder('survey')
      .innerJoinAndSelect('survey.surveyMedia', 'surveyMedia')
      .leftJoinAndSelect('surveyMedia.surveyPoint', 'surveyPoints')
      .where('survey.site_id = :siteId', { siteId: site.id })
      .andWhere('surveyMedia.hidden = False')
      .getMany();

    return Promise.all(
      surveyDetails.map(async (survey) => {
        const siteTimeSeries = await this.getClosestTimeSeriesData(
          survey.diveDate,
          survey.siteId,
          [Metric.BOTTOM_TEMPERATURE, Metric.TOP_TEMPERATURE],
          [SourceType.SPOTTER],
        );

        const dailyData = await this.getClosestDailyData(
          survey.diveDate,
          survey.siteId,
        );

        const surveyMedia = await Promise.all(
          survey.surveyMedia!.map(async (media) => {
            if (!media.surveyPointId) {
              return media;
            }

            const surveyPointTimeSeries = await this.getClosestTimeSeriesData(
              survey.diveDate,
              survey.siteId,
              [Metric.BOTTOM_TEMPERATURE, Metric.TOP_TEMPERATURE],
              [SourceType.HOBO],
              media.surveyPointId,
            );

            return {
              ...media,
              sensorData: surveyPointTimeSeries,
            };
          }),
        );

        return {
          ...survey,
          surveyMedia,
          sensorData: {
            ...siteTimeSeries,
            ...dailyData,
          },
        };
      }),
    );
  }

  private async getClosestDailyData(
    diveDate: Date,
    siteId: number,
  ): Promise<SensorDataDto | {}> {
    // We will use this many times in our query, so we declare it as constant
    const diff = `(daily_data.date::timestamp - '${diveDate.toISOString()}'::timestamp)`;

    // We order (ascending) the data by the date difference between the date column and diveData
    // and we grab the first one, which will be the closest one
    const dailyData = await this.dailyDataRepository
      .createQueryBuilder('daily_data')
      .where('daily_data.site_id = :siteId', { siteId })
      .andWhere(`${diff} < INTERVAL '1 d'`)
      .andWhere(`${diff} > INTERVAL '-1 d'`)
      .orderBy(
        `(CASE WHEN ${diff} < INTERVAL '0' THEN (-${diff}) ELSE ${diff} END)`,
        'ASC',
      )
      .getOne();

    if (!dailyData || !dailyData.satelliteTemperature) {
      return {};
    }

    // create object here to typecheck
    const ret: SensorDataDto = {
      [SourceType.NOAA]: {
        satelliteTemperature: {
          value: dailyData.satelliteTemperature,
          timestamp: dailyData.date,
        },
      },
    };

    return ret;
  }

  private async getClosestTimeSeriesData(
    diveDate: Date,
    siteId: number,
    metrics: Metric[],
    sourceTypes: SourceType[],
    surveyPointId?: number,
  ) {
    const surveyPointCondition = surveyPointId
      ? `source.survey_point_id = ${surveyPointId}`
      : 'source.survey_point_id IS NULL';
    // We will use this many times in our query, so we declare it as constant
    const diff = `(time_series.timestamp::timestamp - '${diveDate.toISOString()}'::timestamp)`;

    // First get all sources needed to avoid inner join later
    const sources = await this.sourcesRepository
      .createQueryBuilder('source')
      .where('source.type IN (:...sourceTypes)', { sourceTypes })
      .andWhere('source.site_id = :siteId', { siteId })
      .andWhere(surveyPointCondition)
      .getMany();

    if (!sources.length) {
      return {};
    }

    // Create map from source_id to source entity
    const sourceMap = keyBy(sources, (source) => source.id);

    // Grab all data at an interval of +/- 24 hours around the diveDate
    // Order (descending) those data by the absolute time distance between the data and the survey diveDate
    // This way the closest data point for each metric for each source type will be the last row
    const timeSeriesData: TimeSeriesData[] = await this.timeSeriesRepository
      .createQueryBuilder('time_series')
      .select('time_series.timestamp', 'timestamp')
      .addSelect('time_series.value', 'value')
      .addSelect('time_series.metric', 'metric')
      .addSelect('time_series.source_id', 'source')
      .where(`${diff} < INTERVAL '1 d'`)
      .andWhere(`${diff} > INTERVAL '-1 d'`)
      .andWhere('time_series.metric IN (:...metrics)', { metrics })
      .andWhere('time_series.source_id IN (:...sourceIds)', {
        sourceIds: Object.keys(sourceMap),
      })
      .orderBy(
        `time_series.source_id, metric, (CASE WHEN ${diff} < INTERVAL '0' THEN (-${diff}) ELSE ${diff} END)`,
        'DESC',
      )
      .getRawMany();

    // Group the data by source id
    const groupedData = groupBy(timeSeriesData, (o) => o.source);

    return Object.keys(groupedData).reduce<SensorDataDto>(
      (data, key) => ({
        ...data,
        // Replace source id by source using the mapped source object
        // Keep only timestamps and value from the resulting objects
        [sourceMap[key].type]: mapValues(
          // Use key by to group the data by metric and keep only the last entry, i.e. the closest one
          mapKeys(
            keyBy(groupedData[key], (grouped) => grouped.metric),
            (_v, k) => camelCase(k),
          ),
          (v) => ({ timestamp: v.timestamp, value: v.value }),
        ),
      }),
      {},
    );
  }
}
