import { mapValues, meanBy, pick, map, camelCase } from 'lodash';
import { SondeMetricsKeys } from 'constants/sondeConfig';
import { TimeSeriesData } from 'store/Sites/types';

export const calculateSourceDataMeanValues = (
  metrics: SondeMetricsKeys[],
  timeSeriesData?: TimeSeriesData,
) =>
  mapValues(pick(timeSeriesData, map(metrics, camelCase)), (data) =>
    meanBy(data?.sonde?.data, 'value'),
  );
