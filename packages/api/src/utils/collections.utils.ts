import _ from 'lodash';
import { In, Not, Repository } from 'typeorm';
import { CollectionDataDto } from '../collections/dto/collection-data.dto';
import { Reef } from '../reefs/reefs.entity';
import { SourceType } from '../reefs/schemas/source-type.enum';
import { LatestData } from '../time-series/latest-data.entity';
import { Metric } from '../time-series/metrics.entity';
import { getSstAnomaly } from './liveData';

export const getCollectionData = async (
  reefs: Reef[],
  latestDataRepository: Repository<LatestData>,
): Promise<Record<number, CollectionDataDto>> => {
  // Get latest data
  const latestData = await latestDataRepository.find({
    where: {
      reef: In(reefs.map((reef) => reef.id)),
      source: Not(SourceType.HOBO),
    },
    relations: ['reef', 'reef.historicalMonthlyMean'],
  });

  // Map data to each reef and map each reef's data to the CollectionDataDto
  return _(latestData)
    .groupBy((o) => o.reefId)
    .mapValues<CollectionDataDto>((data) =>
      data.reduce<CollectionDataDto>((acc, reefData): CollectionDataDto => {
        return {
          ...acc,
          [reefData.metric]: reefData.value,
          ...(reefData.metric === Metric.SATELLITE_TEMPERATURE
            ? {
                sst_anomaly: getSstAnomaly(
                  reefData.reef.historicalMonthlyMean,
                  {
                    value: reefData.value,
                    timestamp: reefData.timestamp.toISOString(),
                  },
                ),
              }
            : {}),
        };
      }, {}),
    )
    .toJSON();
};
