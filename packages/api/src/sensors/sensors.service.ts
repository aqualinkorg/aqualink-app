import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Bluebird from 'bluebird';
import { keyBy } from 'lodash';
import { GeoJSON, Point } from 'geojson';
import { IsNull, Not, Repository } from 'typeorm';
import { Reef, SensorType } from '../reefs/reefs.entity';
import { Survey } from '../surveys/surveys.entity';
import { Metric } from '../time-series/metrics.entity';
import { TimeSeries } from '../time-series/time-series.entity';
import { getReefFromSensorId } from '../utils/reef.utils';
import { getSpotterData, getLatestData } from '../utils/sofar';
import { createPoint } from '../utils/coordinates';
import { SpotterData } from '../utils/sofar.types';
import {
  getDataQuery,
  groupByMetricAndSource,
  getClosestTimeSeriesData,
} from '../utils/time-series.utils';
import { Sources } from '../reefs/sources.entity';
import { SourceType } from '../reefs/schemas/source-type.enum';

@Injectable()
export class SensorsService {
  constructor(
    @InjectRepository(Reef)
    private reefRepository: Repository<Reef>,

    @InjectRepository(Sources)
    private sourcesRepository: Repository<Sources>,

    @InjectRepository(Survey)
    private surveyRepository: Repository<Survey>,

    @InjectRepository(TimeSeries)
    private timeSeriesRepository: Repository<TimeSeries>,
  ) {}

  async findSensors(): Promise<
    (Reef & { sensorPosition: GeoJSON; sensorType: SensorType })[]
  > {
    const reefs = await this.reefRepository.find({
      where: { sensorId: Not(IsNull()) },
    });

    // Get spotter data and add reef id to distinguish them
    const spotterData = await Bluebird.map(
      reefs,
      (reef) => {
        return getSpotterData(reef.sensorId!).then((data) => {
          return {
            id: reef.id,
            ...data,
          };
        });
      },
      { concurrency: 10 },
    );

    // Group spotter data by reef id for easier search
    const reefIdToSpotterData: Record<
      number,
      SpotterData & { id: number }
    > = keyBy(spotterData, (o) => o.id);

    // Construct final response
    return reefs.map((reef) => {
      const data = reefIdToSpotterData[reef.id];
      const longitude = getLatestData(data.longitude)?.value;
      const latitude = getLatestData(data.latitude)?.value;
      const reefPosition = reef.polygon as Point;

      // If no longitude or latitude is provided by the spotter fallback to the site coordinates
      return {
        ...reef,
        applied: reef.applied,
        sensorPosition: createPoint(
          longitude || reefPosition.coordinates[0],
          latitude || reefPosition.coordinates[1],
        ),
        sensorType: SensorType.SofarSpotter,
      };
    });
  }

  async findSensorData(
    sensorId: string,
    startDate: Date,
    endDate: Date,
    metrics: string[],
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

    const reef = await getReefFromSensorId(sensorId, this.reefRepository);

    const data = await getDataQuery(
      this.timeSeriesRepository,
      startDate,
      endDate,
      metrics as Metric[],
      reef.id,
    );

    return groupByMetricAndSource(data);
  }

  async findSensorSurveys(sensorId: string) {
    const reef = await getReefFromSensorId(sensorId, this.reefRepository);

    const surveyDetails = await this.surveyRepository
      .createQueryBuilder('survey')
      .innerJoinAndSelect('survey.surveyMedia', 'surveyMedia')
      .leftJoinAndSelect('surveyMedia.poi', 'pois')
      .where('survey.reef_id = :reefId', { reefId: reef.id })
      .andWhere('surveyMedia.hidden = False')
      .getMany();

    return Promise.all(
      surveyDetails.map(async (survey) => {
        const reefSensorData = await getClosestTimeSeriesData(
          survey.diveDate,
          survey.reefId,
          [
            Metric.BOTTOM_TEMPERATURE,
            Metric.TOP_TEMPERATURE,
            Metric.SATELLITE_TEMPERATURE,
          ],
          [SourceType.SPOTTER, SourceType.NOAA],
          this.timeSeriesRepository,
          this.sourcesRepository,
        );

        const surveyMedia = await Promise.all(
          survey.surveyMedia!.map(async (media) => {
            if (!media.poiId) {
              return media;
            }

            const poiTimeSeries = await getClosestTimeSeriesData(
              survey.diveDate,
              survey.reefId,
              [Metric.BOTTOM_TEMPERATURE, Metric.TOP_TEMPERATURE],
              [SourceType.HOBO],
              this.timeSeriesRepository,
              this.sourcesRepository,
              media.poiId,
            );

            return {
              ...media,
              sensorData: poiTimeSeries,
            };
          }),
        );

        return {
          ...survey,
          surveyMedia,
          sensorData: reefSensorData,
        };
      }),
    );
  }
}
