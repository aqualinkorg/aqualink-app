import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Bluebird from 'bluebird';
import { keyBy } from 'lodash';
import { Point } from 'geojson';
import { IsNull, Not, Repository } from 'typeorm';
import { Reef, SpotterType } from '../reefs/reefs.entity';
import { Survey } from '../surveys/surveys.entity';
import { Metric } from '../time-series/metrics.entity';
import { TimeSeries } from '../time-series/time-series.entity';
import { getReefFromSensorId } from '../utils/reef.utils';
import { getSpotterData, getLatestData } from '../utils/sofar';
import { createPoint } from '../utils/coordinates';
import { DEFAULT_SPOTTER_DATA_VALUE, SpotterData } from '../utils/sofar.types';
import {
  getDataQuery,
  groupByMetricAndSource,
} from '../utils/time-series.utils';

@Injectable()
export class CoralAtlasService {
  constructor(
    @InjectRepository(Reef)
    private reefRepository: Repository<Reef>,

    @InjectRepository(Survey)
    private surveyRepository: Repository<Survey>,

    @InjectRepository(TimeSeries)
    private timeSeriesRepository: Repository<TimeSeries>,
  ) {}

  async findSensors() {
    const reefs = await this.reefRepository.find({
      where: { spotterId: Not(IsNull()) },
    });

    // Get spotter data and add reef id to distinguish them
    const spotterData = await Bluebird.map(
      reefs,
      (reef) => {
        if (!reef.spotterId) {
          return {
            id: reef.id,
            ...DEFAULT_SPOTTER_DATA_VALUE,
            longitude: [],
            latitude: [],
          };
        }

        return getSpotterData(reef.spotterId).then((data) => {
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
        sensorPosition: createPoint(
          longitude || reefPosition.coordinates[0],
          latitude || reefPosition.coordinates[1],
        ),
        sensorType: SpotterType.SofarSpotter,
      };
    });
  }

  async findSensorData(
    sensorId: string,
    startDate: Date,
    endDate: Date,
    metrics: Metric[],
  ) {
    const reef = await getReefFromSensorId(sensorId, this.reefRepository);

    const data = await getDataQuery(
      this.timeSeriesRepository,
      startDate,
      endDate,
      metrics,
      false,
      reef.id,
    );

    return groupByMetricAndSource(data);
  }

  async findSensorSurveys(sensorId: string) {
    const reef = await getReefFromSensorId(sensorId, this.reefRepository);

    const surveyDetails = await this.surveyRepository
      .createQueryBuilder('survey')
      .innerJoinAndSelect('survey.surveyMedia', 'surveyMedia')
      .leftJoinAndSelect('surveyMedia.poiId', 'pois')
      .where('survey.reef_id = :reefId', { reefId: reef.id })
      .andWhere('surveyMedia.hidden = False')
      .getMany();

    return surveyDetails;
  }
}
