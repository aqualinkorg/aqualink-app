import { SondeMetricsKeys } from 'constants/chartConfigs/sondeConfig';
import { mapValues, meanBy, pick, map, camelCase } from 'lodash';
import { TimeSeriesData } from 'store/Sites/types';

export const calculateSondeDataMeanValues = (
  metrics: SondeMetricsKeys[],
  timeSeriesData?: TimeSeriesData,
) =>
  mapValues(pick(timeSeriesData, map(metrics, camelCase)), (data) =>
    meanBy(data?.sonde?.data, 'value'),
  );
