import { utcToZonedTime } from 'date-fns-tz';
import { minBy, maxBy, meanBy, isNumber } from 'lodash';
import {
  DAILY_DATA_CURVE_COLOR,
  HISTORICAL_MONTHLY_MEAN_COLOR,
  CHART_MIN_NUMBER_OF_POINTS,
  SPOTTER_BOTTOM_DATA_CURVE_COLOR,
  SPOTTER_TOP_DATA_CURVE_COLOR,
  DAILY_DATA_FILL_COLOR_ABOVE_THRESHOLD,
  DAILY_DATA_FILL_COLOR_BELOW_THRESHOLD,
} from 'constants/charts';
import {
  DailyData,
  DataRange,
  HistoricalMonthlyMean,
  OceanSenseData,
  OceanSenseKeys,
  ValueWithTimestamp,
  TimeSeriesData,
  Metrics,
  TimeSeries,
} from 'store/Sites/types';
import {
  convertSofarDataToLocalTime,
  findMarginalDate,
  generateHistoricalMonthlyMeanTimestamps,
} from 'helpers/dates';
import { DateTime } from 'luxon-extensions';
import { randomColors } from 'layout/App/theme';
import { CardColumn, OceanSenseDataset } from './types';
import type { Dataset } from '../index';
import {
  convertDailyToSofar,
  convertHistoricalMonthlyMeanToSofar,
  filterHistoricalMonthlyMeanData,
} from '../utils';

const filterSofarData =
  (from?: string, to?: string) => (data?: ValueWithTimestamp[]) => {
    if (!from || !to || !data) {
      return data;
    }

    return data?.filter(
      ({ timestamp }) =>
        DateTime.fromISO(timestamp).valueOf() >=
          DateTime.fromISO(from).valueOf() &&
        DateTime.fromISO(timestamp).valueOf() <= DateTime.fromISO(to).valueOf(),
    );
  };

export const calculateCardMetrics = (
  from: string,
  to: string,
  data?: ValueWithTimestamp[],
  keyPrefix?: string,
): CardColumn['rows'] => {
  const filteredData = filterSofarData(from, to)(data);

  return [
    {
      key: `${keyPrefix}-max`,
      value: filteredData?.[0]
        ? maxBy(filteredData, 'value')?.value
        : undefined,
    },
    {
      key: `${keyPrefix}-mean`,
      value: filteredData?.[0] ? meanBy(filteredData, 'value') : undefined,
    },
    {
      key: `${keyPrefix}-min`,
      value: filteredData?.[0]
        ? minBy(filteredData, 'value')?.value
        : undefined,
    },
  ];
};

// Show at least 3 ticks on the chart
export const findChartPeriod = (startDate: string, endDate: string) => {
  const from = DateTime.fromISO(startDate);
  const to = DateTime.fromISO(endDate);
  const week = 7;
  const month = 30;
  const diffDays = to.diff(from, 'days').days;

  switch (true) {
    case diffDays < 2:
      return 'hour';
    case diffDays < 3 * week:
      return 'day';
    case diffDays < 3 * month:
      return 'week';
    default:
      return 'month';
  }
};

export const findDataLimits = (
  historicalMonthlyMean: HistoricalMonthlyMean[],
  dailyData: DailyData[] | undefined,
  timeSeriesData: TimeSeriesData | undefined,
  startDate: string | undefined,
  endDate: string | undefined,
): [string | undefined, string | undefined] => {
  const { bottomTemperature, topTemperature } = timeSeriesData || {};
  const historicalMonthlyMeanData = generateHistoricalMonthlyMeanTimestamps(
    historicalMonthlyMean,
    startDate,
    endDate,
  );
  const filteredHistoricalMonthlyMeanData = filterHistoricalMonthlyMeanData(
    historicalMonthlyMeanData,
    startDate,
    endDate,
  );

  const hasData = Boolean(
    filteredHistoricalMonthlyMeanData?.[0] ||
      dailyData?.[0] ||
      bottomTemperature?.find((x) => x.type === 'spotter')?.data?.[0] ||
      topTemperature?.find((x) => x.type === 'spotter')?.data?.[0] ||
      bottomTemperature?.find((x) => x.type === 'hobo')?.data?.[0],
  );

  return [
    hasData
      ? new Date(
          findMarginalDate(
            filteredHistoricalMonthlyMeanData,
            dailyData || [],
            bottomTemperature?.find((x) => x.type === 'spotter')?.data,
            topTemperature?.find((x) => x.type === 'spotter')?.data,
            bottomTemperature?.find((x) => x.type === 'hobo')?.data,
            'min',
          ),
        ).toISOString()
      : undefined,
    hasData
      ? new Date(
          findMarginalDate(
            filteredHistoricalMonthlyMeanData,
            dailyData || [],
            bottomTemperature?.find((x) => x.type === 'spotter')?.data,
            topTemperature?.find((x) => x.type === 'spotter')?.data,
            bottomTemperature?.find((x) => x.type === 'hobo')?.data,
          ),
        ).toISOString()
      : undefined,
  ];
};

export const findChartWidth = (
  datasets: Dataset[],
): 'small' | 'medium' | 'large' => {
  const nCardColumns = datasets.filter(
    ({ displayCardColumn }) => displayCardColumn,
  ).length;

  switch (true) {
    case nCardColumns === 3:
      return 'small';
    case nCardColumns === 2:
      return 'medium';
    case nCardColumns === 1:
      return 'large';
    default:
      return 'small';
  }
};

export const availableRangeString = (
  sensor: string,
  range?: DataRange,
  timeZone?: string | null,
): string | undefined => {
  const { minDate, maxDate } = range || {};
  const formattedStartDate = minDate
    ? DateTime.fromJSDate(utcToZonedTime(minDate, timeZone || 'UTC')).toFormat(
        'LL/dd/yyyy',
      )
    : undefined;
  const formattedEndDate = maxDate
    ? DateTime.fromJSDate(utcToZonedTime(maxDate, timeZone || 'UTC')).toFormat(
        'LL/dd/yyyy',
      )
    : undefined;
  return formattedStartDate && formattedEndDate
    ? `${sensor} range: ${formattedStartDate} - ${formattedEndDate}`
    : undefined;
};

/**
 * Determines if the input dates differ by more than one year
 * @param startDate - The starting date
 * @param endDate - The ending date
 */
export const moreThanOneYear = (startDate: string, endDate: string) => {
  const from = DateTime.fromISO(startDate);
  const to = DateTime.fromISO(endDate);
  return to.diff(from, 'years').years >= 1;
};

export const localizedEndOfDay = (
  date?: string,
  timeZone?: string | null | undefined,
): string =>
  (date ? DateTime.fromISO(date) : DateTime.now())
    .setZone(timeZone || 'UTC')
    .endOf('day')
    .toISOString();

export const constructOceanSenseDatasets = (
  data?: OceanSenseData,
): Record<OceanSenseKeys, OceanSenseDataset> => ({
  PH: {
    data: data?.PH || [],
    unit: 'pH',
    title: 'ACIDITY (pH)',
    id: 'acidity',
  },
  EC: {
    data: data?.EC || [],
    unit: 'μS',
    title: 'CONDUCTIVITY (μS)',
    id: 'conductivity',
  },
  PRESS: {
    data: data?.PRESS || [],
    unit: 'dbar',
    title: 'PRESSURE (dbar)',
    id: 'pressure',
  },
  DO: {
    data: data?.DO || [],
    unit: 'mg/L',
    title: 'DISSOLVED OXYGEN (mg/L)',
    id: 'dissolved_oxygen',
  },
  ORP: {
    data: data?.ORP || [],
    unit: 'mV',
    title: 'OXIDATION REDUCTION POTENTIAL (mV)',
    id: 'oxidation_reduction_potential',
  },
});

export const hasAtLeastNData = (n: number) => (data?: ValueWithTimestamp[]) =>
  typeof data?.length === 'number' && data.length >= n;

/**
 * A util function used to generate the temperature analysis chart datasets.
 * @param dailyData A daily data array
 * @param spotterBottom An array of spotter bottom temperatures
 * @param spotterTop An array of spotter top temperatures
 * @param hoboBottom An array of hobo top temperatures
 * @param historicalMonthlyMean An array of historical monthly temperatures
 * @param startDate A start date used in the historical monthly mean data generation
 * @param endDate An end date used in the historical monthly mean data generation
 * @param chartStartDate An optionnal chart start date used to filter the datasets
 * @param chartEndDate An optionnal chart end date used to filter the datasets
 * @param timezone An optional timezone option, to convert the data timestamps
 * @param depth The site's depth
 * @returns An array of datasets to display on the chart
 */
export const generateTempAnalysisDatasets = (
  dailyData?: DailyData[],
  spotterBottom?: ValueWithTimestamp[],
  spotterTop?: ValueWithTimestamp[],
  hoboBottom?: TimeSeries,
  historicalMonthlyMean?: HistoricalMonthlyMean[],
  startDate?: string,
  endDate?: string,
  chartStartDate?: string,
  chartEndDate?: string,
  timezone?: string | null,
  depth?: number | null,
): Dataset[] => {
  const processedDailyData = convertDailyToSofar(dailyData, [
    'satelliteTemperature',
  ])?.satelliteTemperature;
  const localMonthlyMeanData =
    convertHistoricalMonthlyMeanToSofar(
      filterHistoricalMonthlyMeanData(
        generateHistoricalMonthlyMeanTimestamps(
          historicalMonthlyMean || [],
          startDate,
          endDate,
          timezone,
        ),
        chartStartDate,
        chartEndDate,
      ),
    ) || [];
  const [
    localDailyData,
    localSpotterBottomData,
    localSpotterTopData,
    ...localHoboBottomData
  ] = [
    processedDailyData,
    spotterBottom,
    spotterTop,
    ...(hoboBottom?.map((x) => x.data) || []),
  ].map(convertSofarDataToLocalTime(timezone));

  const [
    hasEnoughSpotterBottomData,
    hasEnoughSpotterTopData,
    hasEnoughDailyData,
    ...hasEnoughHoboBottomData
  ] = [
    localSpotterBottomData,
    localSpotterTopData,
    localDailyData,
    ...localHoboBottomData,
  ]
    .map(filterSofarData(chartStartDate, chartEndDate))
    .map(hasAtLeastNData(CHART_MIN_NUMBER_OF_POINTS));
  const hasEnoughMonthlyMeanData = hasAtLeastNData(1)(localMonthlyMeanData);

  return [
    {
      label: 'MONTHLY MEAN',
      cardColumnName: 'HISTORIC',
      cardColumnTooltip:
        'Historic long-term average of satellite surface temperature',
      data: localMonthlyMeanData,
      curveColor: HISTORICAL_MONTHLY_MEAN_COLOR,
      type: 'line',
      unit: '°C',
      tooltipMaxHoursGap: 24 * 15,
      displayData: hasEnoughMonthlyMeanData,
      displayCardColumn: hasEnoughMonthlyMeanData,
      metric: 'satelliteTemperature',
      source: 'noaa',
    },
    {
      label: 'SURFACE',
      data: localDailyData,
      curveColor: DAILY_DATA_CURVE_COLOR,
      maxHoursGap: 48,
      tooltipMaxHoursGap: 24,
      type: 'line',
      unit: '°C',
      cardColumnName: 'SST',
      surveysAttached: true,
      isDailyUpdated: true,
      displayData: hasEnoughDailyData,
      displayCardColumn:
        !hasEnoughSpotterBottomData &&
        !hasEnoughSpotterTopData &&
        !hasEnoughHoboBottomData.find((x) => x) &&
        hasEnoughDailyData,
      metric: 'sstAnomaly',
      source: 'noaa',
    },
    {
      label: 'BUOY 1m',
      data: localSpotterTopData,
      curveColor: SPOTTER_TOP_DATA_CURVE_COLOR,
      type: 'line',
      unit: '°C',
      maxHoursGap: 24,
      tooltipMaxHoursGap: 6,
      displayData: hasEnoughSpotterTopData,
      displayCardColumn: hasEnoughSpotterTopData,
      metric: 'topTemperature',
      source: 'spotter',
    },
    {
      label: `BUOY ${depth}m`,
      data: localSpotterBottomData,
      curveColor: SPOTTER_BOTTOM_DATA_CURVE_COLOR,
      type: 'line',
      unit: '°C',
      maxHoursGap: 24,
      tooltipMaxHoursGap: 6,
      displayData: hasEnoughSpotterBottomData,
      displayCardColumn: hasEnoughSpotterBottomData,
      metric: 'bottomTemperature',
      source: 'spotter',
    },
    ...(hoboBottom?.map((item, index) => {
      const label = item.depth !== undefined ? `HOBO at ${item.depth}` : 'HOBO';
      const tooltipLabel =
        item.depth !== undefined ? `HOBO ${item.depth}m` : 'HOBO';

      const dataset: Dataset = {
        label,
        data: localHoboBottomData[index],
        curveColor: randomColors[index],
        type: 'line',
        unit: '°C',
        maxHoursGap: 24,
        tooltipMaxHoursGap: 6,
        tooltipLabel,
        displayData: hasEnoughHoboBottomData.find((x) => x),
        displayCardColumn:
          !hasEnoughSpotterBottomData &&
          !hasEnoughSpotterTopData &&
          hasEnoughHoboBottomData.find((x) => x && index === 1),
        metric: 'bottomTemperature',
        source: 'hobo',
      };
      return dataset;
    }) || []),
  ];
};

/**
 * A util function to generate a dataset for a specific metric
 * @param label The label of the dataset
 * @param data The metric data
 * @param unit The data units
 * @param color The curve color
 * @param chartStartDate An optional param for the chart's start date, used filter the data
 * @param chartEndDate An optional param for the chart's end date, used filter the data
 * @param timezone An optional timezone option, to convert the data timestamps
 * @returns A dataset for the specified metric
 */
export const generateMetricDataset = (
  label: string,
  data: ValueWithTimestamp[],
  unit: string,
  color: string,
  chartStartDate?: string,
  chartEndDate?: string,
  timezone?: string | null,
  metric?: Metrics,
): Dataset => {
  const display = hasAtLeastNData(CHART_MIN_NUMBER_OF_POINTS)(
    filterSofarData(chartStartDate, chartEndDate)(data),
  );

  return {
    label,
    data: convertSofarDataToLocalTime(timezone)(data),
    unit,
    curveColor: color,
    type: 'line',
    maxHoursGap: 24,
    tooltipMaxHoursGap: 6,
    displayData: display,
    displayCardColumn: display,
    metric,
  };
};

/**
 * A util function to generate the daily temperature dataset.
 * Eg. used in combined charts and for the selected site card.
 * @param data The input daily data
 * @param threshold An optional temperature threshold
 * @param surveysAttached A boolean to determine if we will display the surveys scatter plot or not
 * @param timezone An optional timezone option, to convert the data timestamps
 * @returns A dataset for the daily data
 */
export const standardDailyDataDataset = (
  data: DailyData[],
  threshold: number | null,
  surveysAttached?: boolean,
  timezone?: string | null,
): Dataset => ({
  label: 'SURFACE',
  data: convertSofarDataToLocalTime(timezone)(
    convertDailyToSofar(data, ['satelliteTemperature'])?.satelliteTemperature,
  ),
  curveColor: DAILY_DATA_CURVE_COLOR,
  type: 'line',
  unit: '°C',
  maxHoursGap: 48,
  tooltipMaxHoursGap: 24,
  considerForXAxisLimits: true,
  isDailyUpdated: true,
  surveysAttached,
  displayData: true,
  threshold: isNumber(threshold) ? threshold + 1 : undefined,
  fillColorAboveThreshold: DAILY_DATA_FILL_COLOR_ABOVE_THRESHOLD,
  fillColorBelowThreshold: DAILY_DATA_FILL_COLOR_BELOW_THRESHOLD,
});
