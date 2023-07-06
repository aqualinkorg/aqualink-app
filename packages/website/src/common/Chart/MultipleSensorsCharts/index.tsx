import React, { useEffect, useState } from 'react';
import isISODate from 'validator/lib/isISO8601';
import { Box, Container, makeStyles, Theme } from '@material-ui/core';
import moment from 'moment';
import { camelCase, isNaN, isNumber, snakeCase, sortBy } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import { oceanSenseConfig } from 'constants/oceanSenseConfig';
import { getPublicSondeMetrics, getSondeConfig } from 'constants/sondeConfig';
import {
  METLOG_DATA_COLOR,
  OCEAN_SENSE_DATA_COLOR,
  SONDE_DATA_COLOR,
  SPOTTER_METRIC_DATA_COLOR,
  HUI_DATA_COLOR,
} from 'constants/charts';
import {
  getMetlogConfig,
  getPublicMetlogMetrics,
} from 'constants/metlogConfig';
import {
  siteGranularDailyDataSelector,
  siteOceanSenseDataRequest,
  siteOceanSenseDataSelector,
  siteTimeSeriesDataRangeLoadingSelector,
  siteTimeSeriesDataRangeSelector,
  siteTimeSeriesDataRequest,
  siteTimeSeriesDataSelector,
} from 'store/Sites/selectedSiteSlice';
import { Metrics, MetricsKeys, Site, Sources } from 'store/Sites/types';
import { useQueryParam } from 'hooks/useQueryParams';
import {
  rangeOverlapWithRange,
  isBefore,
  setTimeZone,
  subtractFromDate,
} from 'helpers/dates';
import { getSourceRanges } from 'helpers/siteUtils';
import {
  constructOceanSenseDatasets,
  findChartWidth,
  findDataLimits,
  generateMetricDataset,
  generateTempAnalysisDatasets,
  localizedEndOfDay,
} from './helpers';
import { RangeValue } from './types';
import ChartWithCard from './ChartWithCard';
import DownloadCSVButton from './DownloadCSVButton';
import {
  getHuiConfig,
  getPublicHuiMetrics,
} from '../../../constants/huiConfig';

const DEFAULT_METRICS: MetricsKeys[] = [
  'bottom_temperature',
  'top_temperature',
  'wind_speed',
  'significant_wave_height',
  'barometric_pressure_top',
  'barometric_pressure_bottom',
];

interface SpotterConfig {
  unit: string;
  title: string;
  convert?: number;
}

const spotterConfig: Partial<Record<Metrics, SpotterConfig>> = {
  windSpeed: {
    unit: 'km/h',
    title: 'Wind Speed',
    // convert from m/s to to km/h
    convert: 3.6,
  },
  barometricPressureTop: {
    unit: 'hPa',
    title: 'Surface Barometric Pressure',
  },
  barometricPressureBottom: {
    unit: 'hPa',
    title: 'Bottom Pressure',
  },
  significantWaveHeight: {
    unit: 'm',
    title: 'Significant Wave Height',
  },
  surfaceTemperature: {
    unit: '°C',
    title: 'Surface Temperature',
  },
};

const MultipleSensorsCharts = ({
  site,
  pointId,
  surveysFiltered,
  disableGutters,
  displayOceanSenseCharts,
  setParentAvailableSources,
}: MultipleSensorsChartsProps) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [startParam, setStartParam] = useQueryParam('start', isISODate);
  const [endParam, setEndParam] = useQueryParam('end', isISODate);
  const [chartParam] = useQueryParam('chart');
  const granularDailyData = useSelector(siteGranularDailyDataSelector);
  const timeSeriesData = useSelector(siteTimeSeriesDataSelector);
  const oceanSenseData = useSelector(siteOceanSenseDataSelector);
  const { bottomTemperature, topTemperature } = timeSeriesData || {};
  const { hobo: hoboBottomTemperature } = bottomTemperature || {};
  const timeSeriesDataRanges = useSelector(siteTimeSeriesDataRangeSelector);
  const { hobo: hoboBottomTemperatureRange } =
    timeSeriesDataRanges?.bottomTemperature || {};
  const rangesLoading = useSelector(siteTimeSeriesDataRangeLoadingSelector);
  const [availableSources, setAvailableSources] = useState<Sources[]>([]);
  const [pickerEndDate, setPickerEndDate] = useState<string>();
  const [pickerStartDate, setPickerStartDate] = useState<string>();
  const [endDate, setEndDate] = useState<string>();
  const [startDate, setStartDate] = useState<string>();
  const [pickerErrored, setPickerErrored] = useState(false);
  const [range, setRange] = useState<RangeValue>(
    startParam || endParam ? 'custom' : 'one_month',
  );

  const today = localizedEndOfDay(undefined, site.timezone);

  const hasSpotterData = Boolean(
    bottomTemperature?.spotter?.data?.[1] || topTemperature?.spotter?.data?.[1],
  );

  const hasSondeData = availableSources.includes('sonde');

  const hasMetlogData = availableSources.includes('metlog');

  const hasHuiData = availableSources.includes('hui');

  const chartStartDate = startDate || subtractFromDate(today, 'week');
  const chartEndDate = moment
    .min(
      moment(),
      moment(endDate)
        .tz(site.timezone || 'UTC')
        .endOf('day'),
    )
    .toISOString();

  const hasOceanSenseId = Boolean(oceanSenseConfig?.[site.id]);

  const tempAnalysisDatasets = generateTempAnalysisDatasets(
    granularDailyData,
    timeSeriesData?.bottomTemperature?.spotter?.data,
    timeSeriesData?.topTemperature?.spotter?.data,
    hoboBottomTemperature?.data,
    site.historicalMonthlyMean,
    startDate,
    endDate,
    chartStartDate,
    chartEndDate,
    site.timezone,
    site.depth,
  );

  const spotterMetricDataset = (metric: Metrics) => {
    const { unit, convert } = spotterConfig[metric] || {};

    return generateMetricDataset(
      'SENSOR',
      timeSeriesData?.[metric]?.spotter?.data?.map((item) => ({
        ...item,
        value: convert ? convert * item.value : item.value,
      })) || [],
      unit || '',
      SPOTTER_METRIC_DATA_COLOR,
      chartStartDate,
      chartEndDate,
      site.timezone,
      metric,
    );
  };

  const sondeDatasets = () =>
    hasSondeData
      ? sortBy(getPublicSondeMetrics(), (key) => getSondeConfig(key).order)
          .filter(
            (key) =>
              timeSeriesData?.[camelCase(key) as Metrics]?.sonde?.data?.length,
          )
          .map((key) => {
            const { data, surveyPoint } =
              timeSeriesData?.[camelCase(key) as Metrics]?.sonde || {};
            const { title, units } = getSondeConfig(key);

            return {
              key,
              title,
              surveyPoint,
              dataset: generateMetricDataset(
                'SENSOR',
                data || [],
                units,
                SONDE_DATA_COLOR,
                chartStartDate,
                chartEndDate,
                site.timezone,
              ),
            };
          })
      : [];

  const metlogDatasets = () =>
    hasMetlogData
      ? sortBy(getPublicMetlogMetrics(), (key) => getMetlogConfig(key).order)
          .filter(
            (key) =>
              timeSeriesData?.[camelCase(key) as Metrics]?.metlog?.data?.length,
          )
          .map((key) => {
            const { data, surveyPoint } =
              timeSeriesData?.[camelCase(key) as Metrics]?.metlog || {};
            const { title, units, convert } = getMetlogConfig(key);

            return {
              key,
              title,
              surveyPoint,
              dataset: generateMetricDataset(
                'SENSOR',
                (data || []).map((item) => ({
                  ...item,
                  value: isNumber(convert) ? item.value * convert : item.value,
                })),
                units,
                METLOG_DATA_COLOR,
                chartStartDate,
                chartEndDate,
                site.timezone,
              ),
            };
          })
      : [];

  const huiDatasets = () =>
    hasHuiData
      ? sortBy(getPublicHuiMetrics(), (key) => getHuiConfig(key).order)
          .filter((key) => {
            return timeSeriesData?.[camelCase(key) as Metrics]?.hui?.data
              ?.length;
          })
          .map((key) => {
            const { data, surveyPoint } =
              timeSeriesData?.[camelCase(key) as Metrics]?.hui || {};
            const { title, units } = getHuiConfig(key);

            return {
              key,
              title,
              surveyPoint,
              dataset: generateMetricDataset(
                'HUI',
                data || [],
                units,
                HUI_DATA_COLOR,
                chartStartDate,
                chartEndDate,
                site.timezone,
              ),
            };
          })
      : [];

  // Scroll to the chart defined by the chartParam query param.
  useEffect(() => {
    if (chartParam) {
      const chartElement = document.getElementById(chartParam);
      chartElement?.scrollIntoView();
    }
  }, [chartParam]);

  // Set pickers initial values once the range request is completed
  useEffect(() => {
    if (!rangesLoading && !pickerStartDate && !pickerEndDate) {
      const { maxDate } = hoboBottomTemperatureRange?.data?.[0] || {};
      const localizedMaxDate = localizedEndOfDay(maxDate, site.timezone);
      const pastOneMonth = moment(
        subtractFromDate(localizedMaxDate || today, 'month', 1),
      )
        .tz(site.timezone || 'UTC')
        .startOf('day')
        .toISOString();
      setPickerStartDate(
        startParam
          ? zonedTimeToUtc(startParam, site.timezone || 'UTC').toISOString()
          : utcToZonedTime(pastOneMonth, site.timezone || 'UTC').toISOString(),
      );
      setPickerEndDate(
        endParam
          ? zonedTimeToUtc(endParam, site.timezone || 'UTC').toISOString()
          : utcToZonedTime(
              localizedMaxDate || today,
              site.timezone || 'UTC',
            ).toISOString(),
      );
    }
  }, [
    hoboBottomTemperatureRange,
    endParam,
    startParam,
    pickerStartDate,
    pickerEndDate,
    rangesLoading,
    site.timezone,
    today,
  ]);

  // Get time series data
  useEffect(() => {
    if (
      pickerStartDate &&
      pickerEndDate &&
      isBefore(pickerStartDate, pickerEndDate) &&
      timeSeriesDataRanges
    ) {
      const sondeRanges = getSourceRanges(timeSeriesDataRanges, 'sonde').filter(
        (x) =>
          rangeOverlapWithRange(
            x.minDate,
            x.maxDate,
            pickerStartDate,
            pickerEndDate,
          ),
      );

      const metlogRanges = getSourceRanges(
        timeSeriesDataRanges,
        'metlog',
      ).filter((x) =>
        rangeOverlapWithRange(
          x.minDate,
          x.maxDate,
          pickerStartDate,
          pickerEndDate,
        ),
      );

      const huiRanges = getSourceRanges(timeSeriesDataRanges, 'hui').filter(
        (x) =>
          rangeOverlapWithRange(
            x.minDate,
            x.maxDate,
            pickerStartDate,
            pickerEndDate,
          ),
      );

      const allMetrics = [
        ...DEFAULT_METRICS,
        ...sondeRanges.map((x) => x.metric),
        ...metlogRanges.map((x) => x.metric),
        ...huiRanges.map((x) => x.metric),
      ];

      const uniqueMetrics = [...new Map(allMetrics.map((x) => [x, x])).keys()];

      const newAvailableSources = [
        sondeRanges.length > 0 && 'sonde',
        metlogRanges.length > 0 && 'metlog',
        huiRanges.length > 0 && 'hui',
      ].filter((x): x is Sources => x !== false);

      setAvailableSources(newAvailableSources);
      if (typeof setParentAvailableSources !== 'undefined') {
        setParentAvailableSources(newAvailableSources);
      }

      const siteLocalStartDate = setTimeZone(
        new Date(pickerStartDate),
        site.timezone,
      );

      const siteLocalEndDate = setTimeZone(
        new Date(pickerEndDate),
        site.timezone,
      );

      dispatch(
        siteTimeSeriesDataRequest({
          siteId: `${site.id}`,
          pointId,
          start: siteLocalStartDate,
          end: siteLocalEndDate,
          metrics: uniqueMetrics,
          hourly:
            moment(siteLocalEndDate).diff(moment(siteLocalStartDate), 'days') >
            2,
        }),
      );

      if (hasOceanSenseId) {
        dispatch(
          siteOceanSenseDataRequest({
            sensorID: oceanSenseConfig[site.id],
            startDate: siteLocalStartDate,
            endDate: siteLocalEndDate,
            latest: false,
          }),
        );
      }
    }
  }, [
    dispatch,
    hasOceanSenseId,
    pickerEndDate,
    pickerStartDate,
    pointId,
    setParentAvailableSources,
    site.id,
    site.timezone,
    timeSeriesDataRanges,
  ]);

  // Set chart start/end dates based on data received
  useEffect(() => {
    const pickerLocalEndDate = new Date(
      setTimeZone(
        new Date(moment(pickerEndDate).format('MM/DD/YYYY')),
        site?.timezone,
      ),
    ).toISOString();
    const pickerLocalStartDate = new Date(
      setTimeZone(
        new Date(moment(pickerStartDate).format('MM/DD/YYYY')),
        site?.timezone,
      ),
    ).toISOString();

    const [minDataDate, maxDataDate] = findDataLimits(
      site.historicalMonthlyMean,
      granularDailyData,
      timeSeriesData,
      pickerLocalStartDate,
      localizedEndOfDay(pickerLocalEndDate, site.timezone),
    );

    setStartDate(
      minDataDate
        ? moment
            .max(moment(minDataDate), moment(pickerLocalStartDate))
            .toISOString()
        : pickerLocalStartDate,
    );

    setEndDate(
      maxDataDate
        ? moment
            .min(moment(maxDataDate), moment(pickerLocalEndDate).endOf('day'))
            .toISOString()
        : moment(pickerLocalEndDate).endOf('day').toISOString(),
    );
  }, [granularDailyData, pickerEndDate, pickerStartDate, site, timeSeriesData]);

  useEffect(() => {
    if (pickerStartDate && pickerEndDate && range === 'custom') {
      const newStartParam = moment(
        utcToZonedTime(pickerStartDate, site.timezone || 'UTC'),
      ).format('YYYY-MM-DD');
      const newEndParam = moment(
        utcToZonedTime(pickerEndDate, site.timezone || 'UTC'),
      ).format('YYYY-MM-DD');
      setStartParam(newStartParam);
      setEndParam(newEndParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickerEndDate, pickerStartDate, range, setEndParam, setStartParam]);

  // Set picker error
  useEffect(() => {
    if (pickerStartDate && pickerEndDate) {
      setPickerErrored(!isBefore(pickerStartDate, pickerEndDate));
    }
  }, [pickerEndDate, pickerStartDate]);

  const dataForCsv = [
    ...tempAnalysisDatasets.map((dataset) => ({
      name: `${snakeCase(dataset.metric) || 'unknown_Metric'}_${
        dataset.source || 'unknown_source'
      }`,
      values: dataset.data,
    })),
    ...Object.entries(spotterConfig).map(([key]) => {
      const dataset = spotterMetricDataset(key as Metrics);
      return {
        name: `${snakeCase(key)}_spotter`,
        values: dataset.data,
      };
    }),
    ...Object.entries(constructOceanSenseDatasets(oceanSenseData)).map(
      ([key, item]) => {
        const dataset = generateMetricDataset(
          key,
          item.data,
          item.unit,
          OCEAN_SENSE_DATA_COLOR,
          chartStartDate,
          chartEndDate,
          site.timezone,
        );
        return {
          name: `${snakeCase(item.title.split(' ')[0])}`,
          values: dataset.data,
        };
      },
    ),
    ...sondeDatasets().map(({ title, dataset }) => ({
      name: snakeCase(`${title}_${dataset.label}`),
      values: dataset.data,
    })),
  ].filter((x) => x.values.length > 0);

  const onRangeChange = (value: RangeValue) => {
    const { minDate, maxDate } = hoboBottomTemperatureRange?.data?.[0] || {};
    const localizedMinDate = new Date(
      moment(minDate)
        .tz(site.timezone || 'UTC')
        .format('MM/DD/YYYY'),
    ).toISOString();
    const localizedMaxDate = new Date(
      moment(maxDate)
        .tz(site.timezone || 'UTC')
        .format('MM/DD/YYYY'),
    ).toISOString();
    setRange(value);
    if (value !== 'custom') {
      setStartParam(undefined);
      setEndParam(undefined);
    }
    switch (value) {
      case 'one_month':
        setPickerEndDate(moment(localizedMaxDate).endOf('day').toISOString());
        setPickerStartDate(subtractFromDate(localizedMaxDate, 'month', 1));
        break;
      case 'one_year':
        setPickerEndDate(moment(localizedMaxDate).endOf('day').toISOString());
        setPickerStartDate(subtractFromDate(localizedMaxDate, 'year'));
        break;
      case 'max':
        setPickerEndDate(moment(localizedMaxDate).endOf('day').toISOString());
        setPickerStartDate(localizedMinDate);
        break;
      default:
        break;
    }
  };

  const onPickerDateChange = (type: 'start' | 'end') => (date: Date | null) => {
    const time = date?.getTime();
    if (date && time && !isNaN(time)) {
      const dateString = date.toISOString();
      setRange('custom');
      switch (type) {
        case 'start':
          // Set picker start date only if input date is after zero time
          if (
            moment(dateString)
              .startOf('day')
              .isSameOrAfter(moment(0).startOf('day'))
          ) {
            setPickerStartDate(moment(dateString).startOf('day').toISOString());
          }
          break;
        case 'end':
          // Set picker end date only if input date is before today
          if (
            moment(dateString)
              .endOf('day')
              .isSameOrBefore(moment().endOf('day'))
          ) {
            setPickerEndDate(moment(dateString).endOf('day').toISOString());
          }
          break;
        default:
          break;
      }
    }
  };

  return (
    <Container
      disableGutters={disableGutters}
      className={classes.chartWithRange}
    >
      <div className={classes.buttonWrapper}>
        <DownloadCSVButton
          data={dataForCsv}
          startDate={pickerStartDate}
          endDate={pickerEndDate}
          siteId={site.id}
          pointId={pointId}
          className={classes.button}
          defaultMetrics={DEFAULT_METRICS}
        />
      </div>
      <ChartWithCard
        id="temperature"
        range={range}
        onRangeChange={onRangeChange}
        disableMaxRange={!hoboBottomTemperatureRange?.data?.[0]}
        chartTitle="TEMPERATURE ANALYSIS"
        availableRanges={[
          {
            name: 'Spotter',
            data: timeSeriesDataRanges?.bottomTemperature?.spotter?.data,
          },
          {
            name: 'HOBO',
            data: timeSeriesDataRanges?.bottomTemperature?.hobo?.data,
          },
        ]}
        timeZone={site.timezone}
        chartWidth={findChartWidth(tempAnalysisDatasets)}
        site={site}
        datasets={tempAnalysisDatasets}
        pointId={pointId ? parseInt(pointId, 10) : undefined}
        pickerStartDate={pickerStartDate || subtractFromDate(today, 'week')}
        pickerEndDate={pickerEndDate || today}
        chartStartDate={chartStartDate}
        chartEndDate={chartEndDate}
        onStartDateChange={onPickerDateChange('start')}
        onEndDateChange={onPickerDateChange('end')}
        isPickerErrored={pickerErrored}
        areSurveysFiltered={surveysFiltered}
      />
      {hasSpotterData &&
        Object.entries(spotterConfig).map(([key, { title }]) => {
          const datasets = [spotterMetricDataset(key as Metrics)];
          // Since barometric data will only be available for a few sites,
          // we don’t want to display the warning message for all the others.
          if (
            !datasets[0] ||
            (datasets[0].metric === 'barometricPressureTop' &&
              !datasets[0].displayData) ||
            (datasets[0].metric === 'barometricPressureBottom' &&
              !datasets[0].displayData)
          ) {
            return <></>;
          }
          return (
            <Box mt={4} key={title}>
              <ChartWithCard
                datasets={datasets}
                id={key}
                range={range}
                onRangeChange={onRangeChange}
                disableMaxRange={!hoboBottomTemperatureRange?.data?.[0]}
                chartTitle={title}
                availableRanges={[
                  {
                    name: 'Spotter',
                    data: timeSeriesDataRanges?.[key as Metrics]?.spotter?.data,
                  },
                ]}
                timeZone={site.timezone}
                showRangeButtons={false}
                chartWidth="large"
                site={site}
                pickerStartDate={
                  pickerStartDate || subtractFromDate(today, 'week')
                }
                pickerEndDate={pickerEndDate || today}
                chartStartDate={chartStartDate}
                chartEndDate={chartEndDate}
                onStartDateChange={onPickerDateChange('start')}
                onEndDateChange={onPickerDateChange('end')}
                isPickerErrored={pickerErrored}
                showDatePickers={false}
                hideYAxisUnits
                cardColumnJustification="flex-start"
              />
            </Box>
          );
        })}
      {displayOceanSenseCharts &&
        hasOceanSenseId &&
        Object.entries(constructOceanSenseDatasets(oceanSenseData)).map(
          ([key, item]) => (
            <Box mt={4} key={item.title}>
              <ChartWithCard
                datasets={[
                  generateMetricDataset(
                    key,
                    item.data,
                    item.unit,
                    OCEAN_SENSE_DATA_COLOR,
                    chartStartDate,
                    chartEndDate,
                    site.timezone,
                  ),
                ]}
                id={item.id}
                range={range}
                onRangeChange={onRangeChange}
                disableMaxRange={!hoboBottomTemperatureRange?.data?.[0]}
                chartTitle={item.title}
                timeZone={site.timezone}
                showRangeButtons={false}
                chartWidth="large"
                site={site}
                pickerStartDate={
                  pickerStartDate || subtractFromDate(today, 'week')
                }
                pickerEndDate={pickerEndDate || today}
                chartStartDate={chartStartDate}
                chartEndDate={chartEndDate}
                onStartDateChange={onPickerDateChange('start')}
                onEndDateChange={onPickerDateChange('end')}
                isPickerErrored={pickerErrored}
                showDatePickers={false}
                hideYAxisUnits
                cardColumnJustification="flex-start"
              />
            </Box>
          ),
        )}
      {sondeDatasets().map(({ key, title, surveyPoint, dataset }) => (
        <Box mt={4} key={key}>
          <ChartWithCard
            datasets={[dataset]}
            id={key}
            range={range}
            onRangeChange={onRangeChange}
            disableMaxRange={!hoboBottomTemperatureRange?.data?.[0]}
            chartTitle={title}
            availableRanges={[
              {
                name: 'Sonde',
                data: timeSeriesDataRanges?.[camelCase(key) as Metrics]?.sonde
                  ?.data,
              },
            ]}
            timeZone={site.timezone}
            showRangeButtons={false}
            chartWidth="large"
            site={site}
            pickerStartDate={pickerStartDate || subtractFromDate(today, 'week')}
            pickerEndDate={pickerEndDate || today}
            chartStartDate={chartStartDate}
            chartEndDate={chartEndDate}
            onStartDateChange={onPickerDateChange('start')}
            onEndDateChange={onPickerDateChange('end')}
            isPickerErrored={pickerErrored}
            showDatePickers={false}
            surveyPoint={surveyPoint}
            hideYAxisUnits
            cardColumnJustification="flex-start"
          />
        </Box>
      ))}
      {metlogDatasets().map(({ key, title, surveyPoint, dataset }) => (
        <Box mt={4} key={key}>
          <ChartWithCard
            datasets={[dataset]}
            id={key}
            range={range}
            onRangeChange={onRangeChange}
            disableMaxRange={!hoboBottomTemperatureRange?.data?.[0]}
            chartTitle={title}
            availableRanges={[
              {
                name: 'Meteorological',
                data: timeSeriesDataRanges?.[camelCase(key) as Metrics]?.metlog
                  ?.data,
              },
            ]}
            timeZone={site.timezone}
            showRangeButtons={false}
            chartWidth="large"
            site={site}
            pickerStartDate={pickerStartDate || subtractFromDate(today, 'week')}
            pickerEndDate={pickerEndDate || today}
            chartStartDate={chartStartDate}
            chartEndDate={chartEndDate}
            onStartDateChange={onPickerDateChange('start')}
            onEndDateChange={onPickerDateChange('end')}
            isPickerErrored={pickerErrored}
            showDatePickers={false}
            surveyPoint={surveyPoint}
            hideYAxisUnits
            cardColumnJustification="flex-start"
          />
        </Box>
      ))}
      {huiDatasets().map(({ key, title, surveyPoint, dataset }) => (
        <Box mt={4} key={key}>
          <ChartWithCard
            datasets={[dataset]}
            id={key}
            range={range}
            onRangeChange={onRangeChange}
            disableMaxRange={!hoboBottomTemperatureRange?.data?.[0]}
            chartTitle={title}
            availableRanges={[
              {
                name: 'HUI',
                data: timeSeriesDataRanges?.[camelCase(key) as Metrics]?.hui
                  ?.data,
              },
            ]}
            timeZone={site.timezone}
            showRangeButtons={false}
            chartWidth="large"
            site={site}
            pickerStartDate={pickerStartDate || subtractFromDate(today, 'week')}
            pickerEndDate={pickerEndDate || today}
            chartStartDate={chartStartDate}
            chartEndDate={chartEndDate}
            onStartDateChange={onPickerDateChange('start')}
            onEndDateChange={onPickerDateChange('end')}
            isPickerErrored={pickerErrored}
            showDatePickers={false}
            surveyPoint={surveyPoint}
            hideYAxisUnits
            cardColumnJustification="flex-start"
          />
        </Box>
      ))}
    </Container>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  chartWithRange: {
    marginTop: theme.spacing(4),
  },
  button: {
    width: 'fit-content',
  },
  buttonWrapper: {
    display: 'flex',
    justifyContent: 'end',
  },
}));

interface MultipleSensorsChartsProps {
  site: Site;
  pointId?: string;
  surveysFiltered: boolean;
  disableGutters: boolean;
  displayOceanSenseCharts?: boolean;
  setParentAvailableSources?: React.Dispatch<React.SetStateAction<Sources[]>>;
}

MultipleSensorsCharts.defaultProps = {
  pointId: undefined,
  displayOceanSenseCharts: true,
};

export default MultipleSensorsCharts;
