import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import _ from 'lodash';
import { IsNull, Not, Repository } from 'typeorm';
import { Reef, SpotterType } from '../reefs/reefs.entity';
import { Survey } from '../surveys/surveys.entity';
import { Metric } from '../time-series/metrics.entity';
import { TimeSeries } from '../time-series/time-series.entity';
import { getReefFromSensorId } from '../utils/reef.utils';
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

    return reefs.map((reef) => ({
      ...reef,
      sensorType: SpotterType.SofarSpotter,
    }));
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

    return _(groupByMetricAndSource(data));
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
