import React, { useEffect, useState } from 'react';
import isISODate from 'validator/lib/isISO8601';
import { Box, Container, Theme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { camelCase, isNaN, snakeCase, sortBy } from 'lodash';
import { useSelector } from 'react-redux';
import { useAppDispatch } from 'store/hooks';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import { oceanSenseConfig } from 'constants/oceanSenseConfig';
import {
  METLOG_DATA_COLOR,
  OCEAN_SENSE_DATA_COLOR,
  SONDE_DATA_COLOR,
  SPOTTER_METRIC_DATA_COLOR,
  HUI_DATA_COLOR,
  SEAPHOX_DATA_COLOR,
} from 'constants/charts';
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
import { rangeOverlapWithRange, isBefore, setTimeZone } from 'helpers/dates';
import { getSourceRanges } from 'helpers/siteUtils';
import { BaseSourceConfig, MonitoringMetric } from 'utils/types';
import {
  DEFAULT_METRICS,
  getPublicSpotterMetrics,
  getSpotterConfig,
} from 'constants/chartConfigs/spotterConfig';
import {
  getPublicSondeMetrics,
  getSondeConfig,
} from 'constants/chartConfigs/sondeConfig';
import {
  getMetlogConfig,
  getPublicMetlogMetrics,
} from 'constants/chartConfigs/metlogConfig';
import { DateTime } from 'luxon-extensions';
import { userInfoSelector } from 'store/User/userSlice';
import monitoringServices from 'services/monitoringServices';
import {
  getPublicSeapHOxMetrics,
  getSeapHOxConfig,
} from 'constants/chartConfigs/seaphoxConfig';
import {
  constructOceanSenseDatasets,
  findChartWidth,
  generateMetricDataset,
  generateTempAnalysisDatasets,
  localizedEndOfDay,
} from './helpers';
import { RangeValue } from './types';
import DownloadCSVButton from './DownloadCSVButton';
import {
  getHuiConfig,
  getPublicHuiMetrics,
} from '../../../constants/chartConfigs/huiConfig';
import ChartWithCard from './ChartWithCard';

const useStyles = makeStyles((theme: Theme) => ({
  chartWithRange: {
    marginTop: theme.spacing(4),
  },
  buttonWrapper: {
    display: 'flex',
    justifyContent: 'end',
  },
}));

function MultipleSensorsCharts({
  site,
  pointId,
  surveysFiltered,
  disableGutters,
  displayOceanSenseCharts = true,
  hasAdditionalSensorData,
}: MultipleSensorsChartsProps) {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const [startParam, setStartParam] = useQueryParam('start', isISODate);
  const [endParam, setEndParam] = useQueryParam('end', isISODate);
  const [chartParam] = useQueryParam('chart');
  const granularDailyData = useSelector(siteGranularDailyDataSelector);
  const timeSeriesData = useSelector(siteTimeSeriesDataSelector);
  const oceanSenseData = useSelector(siteOceanSenseDataSelector);
  const user = useSelector(userInfoSelector);
  const { bottomTemperature } = timeSeriesData || {};
  const hoboBottomTemperatureSensors = bottomTemperature?.filter(
    (x) => x.type === 'hobo',
  );
  const timeSeriesDataRanges = useSelector(siteTimeSeriesDataRangeSelector);
  const hoboBottomTemperatureRange =
    timeSeriesDataRanges?.bottomTemperature?.find((x) => x.type === 'hobo');
  const rangesLoading = useSelector(siteTimeSeriesDataRangeLoadingSelector);
  const [availableSources, setAvailableSources] = useState<Sources[]>([]);
  const [pickerEndDate, setPickerEndDate] = useState<string>();
  const [pickerStartDate, setPickerStartDate] = useState<string>();
  const [endDate, setEndDate] = useState<string>();
  const [startDate, setStartDate] = useState<string>();
  const [pickerErrored, setPickerErrored] = useState(false);
  const [initialPageLoad, setInitialPageLoad] = useState(true);
  const [range, setRange] = useState<RangeValue>(
    startParam || endParam ? 'custom' : 'one_month',
  );

  const today = localizedEndOfDay(undefined, site.timezone);

  const hasSpotterData = availableSources.includes('spotter');

  const hasSondeData = availableSources.includes('sonde');

  const hasMetlogData = availableSources.includes('metlog');

  const hasHuiData = availableSources.includes('hui');

  const hasSeapHOxData = Boolean(
    timeSeriesData &&
    Object.keys(timeSeriesData).some((key) => key.startsWith('seaphox')),
  );

  const chartStartDate =
    startDate || DateTime.fromISO(today).minus({ weeks: 1 }).toISOString();
  const now = DateTime.now();
  const end =
    endDate !== undefined
      ? DateTime.fromISO(endDate)
          .setZone(site.timezone || 'UTC')
          .endOf('day')
      : now;
  const chartEndDate = (
    now.valueOf() < end.valueOf() ? now : end
  ).toISOString();

  const hasOceanSenseId = Boolean(oceanSenseConfig?.[site.id]);

  const tempAnalysisDatasets = generateTempAnalysisDatasets(
    granularDailyData,
    timeSeriesData?.bottomTemperature?.find((x) => x.type === 'spotter')?.data,
    timeSeriesData?.topTemperature?.find((x) => x.type === 'spotter')?.data,
    timeSeriesData?.bottomTemperature?.find((x) => x.type === 'seaphox')?.data,
    hoboBottomTemperatureSensors,
    site.historicalMonthlyMean,
    startDate,
    endDate,
    chartStartDate,
    chartEndDate,
    site.timezone,
    site.depth,
  );

  const getDatesetFun = <T extends MetricsKeys>(
    hasData: boolean,
    color: string,
    source: Sources,
    sensor: string,
    rangeLabel: string,
    getMetrics: () => T[],
    getConfig: (key: T) => BaseSourceConfig,
  ) =>
    hasData
      ? sortBy(getMetrics(), (key) => getConfig(key).order)
          .filter(
            (key) =>
              timeSeriesData?.[camelCase(key) as Metrics]?.find(
                (x) => x.type === source,
              )?.data?.length,
          )
          .map((key) => {
            const { data, surveyPoint } =
              timeSeriesData?.[camelCase(key) as Metrics]?.find(
                (x) => x.type === source,
              ) || {};
            const {
              title,
              units,
              convert,
              decimalPlaces,
              yAxisStepSize,
              yAxisPadding,
              yAxisMin: configYMin,
              yAxisMax: configYMax,
            } = getConfig(key);

            return {
              key,
              title,
              surveyPoint,
              source,
              rangeLabel,
              dataset: {
                ...generateMetricDataset(
                  sensor,
                  (data || []).map((x) => ({
                    ...x,
                    value:
                      typeof convert === 'number' ? convert * x.value : x.value,
                  })),
                  units,
                  color,
                  chartStartDate,
                  chartEndDate,
                  site.timezone,
                ),
                decimalPlaces,
                yAxisStepSize,
                yAxisPadding,
                yAxisMin: configYMin,
                yAxisMax: configYMax,
              },
            };
          })
      : [];

  const spotterDatasets = () =>
    getDatesetFun(
      hasSpotterData,
      SPOTTER_METRIC_DATA_COLOR,
      'spotter',
      'SENSOR',
      'Spotter',
      getPublicSpotterMetrics,
      getSpotterConfig,
    );

  const sondeDatasets = () =>
    getDatesetFun(
      hasSondeData,
      SONDE_DATA_COLOR,
      'sonde',
      'SENSOR',
      'Sonde',
      getPublicSondeMetrics,
      getSondeConfig,
    );

  const metlogDatasets = () =>
    getDatesetFun(
      hasMetlogData,
      METLOG_DATA_COLOR,
      'metlog',
      'SENSOR',
      'Meteorological',
      getPublicMetlogMetrics,
      getMetlogConfig,
    );

  const huiDatasets = () =>
    getDatesetFun(
      hasHuiData,
      HUI_DATA_COLOR,
      'hui',
      'HUI',
      'HUI',
      getPublicHuiMetrics,
      getHuiConfig,
    );

  const seaphoxDatasets = () =>
    getDatesetFun(
      hasSeapHOxData,
      SEAPHOX_DATA_COLOR,
      'spotter',
      'seaphox',
      'seaphox',
      getPublicSeapHOxMetrics,
      getSeapHOxConfig,
    );

  // post monitoring metric
  useEffect(() => {
    if (user?.token) {
      monitoringServices.postMonitoringMetric({
        token: user.token,
        siteId: site.id,
        metric: MonitoringMetric.TimeSeriesRequest,
      });
    }
  }, [site.id, user?.token]);

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
      const pastOneMonth = DateTime.fromISO(localizedMaxDate || today)
        .minus({ months: 1 })
        .setZone(site.timezone || 'UTC')
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
      const sources: Sources[] = ['spotter', 'sonde', 'metlog', 'hui'];
      const [spotterRanges, sondeRanges, metlogRanges, huiRanges] = sources.map(
        (source) =>
          getSourceRanges(timeSeriesDataRanges, source).filter((x) =>
            rangeOverlapWithRange(
              x.minDate,
              x.maxDate,
              pickerStartDate,
              pickerEndDate,
            ),
          ),
      );

      const allMetrics: MetricsKeys[] = [
        ...DEFAULT_METRICS,
        ...sondeRanges.map((x) => x.metric),
        ...metlogRanges.map((x) => x.metric),
        // SeapHOx metrics
        ...(spotterRanges.length > 0 ? [...getPublicSeapHOxMetrics()] : []),
      ];
      const huiMetrics = huiRanges.map((x) => x.metric);

      const uniqueMetrics = [...new Map(allMetrics.map((x) => [x, x])).keys()];

      setAvailableSources(
        [
          spotterRanges.length > 0 && 'spotter',
          sondeRanges.length > 0 && 'sonde',
          metlogRanges.length > 0 && 'metlog',
          huiRanges.length > 0 && 'hui',
        ].filter((x): x is Sources => x !== false),
      );

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
            DateTime.fromISO(siteLocalEndDate).diff(
              DateTime.fromISO(siteLocalStartDate),
              'days',
            ).days > 2,
        }),
      );

      if (huiMetrics.length > 0)
        dispatch(
          siteTimeSeriesDataRequest({
            siteId: `${site.id}`,
            pointId,
            start: siteLocalStartDate,
            end: siteLocalEndDate,
            metrics: huiMetrics,
            hourly: false,
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
    site.id,
    site.timezone,
    timeSeriesDataRanges,
  ]);

  // Set chart start/end dates based on data received
  useEffect(() => {
    const pickerLocalEndDate = new Date(
      setTimeZone(
        (pickerEndDate ? DateTime.fromISO(pickerEndDate) : DateTime.now())
          .startOf('day')
          .toJSDate(),
        site?.timezone,
      ),
    ).toISOString();
    const pickerLocalStartDate = new Date(
      setTimeZone(
        (pickerStartDate ? DateTime.fromISO(pickerStartDate) : DateTime.now())
          .startOf('day')
          .toJSDate(),
        site?.timezone,
      ),
    ).toISOString();

    setStartDate(pickerLocalStartDate);

    setEndDate(DateTime.fromISO(pickerLocalEndDate).endOf('day').toISOString());
  }, [pickerEndDate, pickerStartDate, site?.timezone]);

  useEffect(() => {
    if (pickerStartDate && pickerEndDate && range === 'custom') {
      const newStartParam = DateTime.fromJSDate(
        utcToZonedTime(pickerStartDate, site.timezone || 'UTC'),
      ).toFormat('yyyy-MM-dd');
      const newEndParam = DateTime.fromJSDate(
        utcToZonedTime(pickerEndDate, site.timezone || 'UTC'),
      ).toFormat('yyyy-MM-dd');
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
    ...tempAnalysisDatasets.map((dataset) => {
      const source =
        (dataset.source === 'hobo'
          ? dataset.tooltipLabel?.split(' ').join('_').toLocaleLowerCase()
          : dataset.source) || 'unknown_source';
      return {
        name: `${snakeCase(dataset.metric) || 'unknown_Metric'}_${source}`,
        values: dataset.data,
      };
    }),
    ...spotterDatasets().map(({ title, dataset }) => ({
      name: snakeCase(`${title}_${dataset.label}`),
      values: dataset.data,
    })),
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
    const localizedMinDate = (
      minDate ? DateTime.fromISO(minDate) : DateTime.now()
    )
      .setZone(site.timezone || 'UTC')
      .startOf('day')
      .toISOString();
    const localizedMaxDate = (
      maxDate ? DateTime.fromISO(maxDate) : DateTime.now()
    )
      .setZone(site.timezone || 'UTC')
      .startOf('day')
      .toISOString();

    setRange(value);
    if (value !== 'custom') {
      setStartParam(undefined);
      setEndParam(undefined);
    }
    switch (value) {
      case 'one_month':
        setPickerEndDate(
          DateTime.fromISO(localizedMaxDate).endOf('day').toISOString(),
        );
        setPickerStartDate(
          DateTime.fromISO(localizedMaxDate).minus({ months: 1 }).toISOString(),
        );
        break;
      case 'one_year':
        setPickerEndDate(
          DateTime.fromISO(localizedMaxDate).endOf('day').toISOString(),
        );
        setPickerStartDate(
          DateTime.fromISO(localizedMaxDate).minus({ years: 1 }).toISOString(),
        );
        break;
      case 'max':
        setPickerEndDate(
          DateTime.fromISO(localizedMaxDate).endOf('day').toISOString(),
        );
        setPickerStartDate(localizedMinDate);
        break;
      default:
        break;
    }
  };

  React.useEffect(() => {
    if (
      initialPageLoad &&
      availableSources &&
      hasAdditionalSensorData &&
      !hasHuiData &&
      !hasSondeData &&
      !(startParam || endParam)
    ) {
      onRangeChange('one_year');
      setInitialPageLoad(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    availableSources,
    hasAdditionalSensorData,
    hasHuiData,
    hasSondeData,
    initialPageLoad,
    startParam,
    endParam,
  ]);

  const onPickerDateChange = (type: 'start' | 'end') => (date: Date | null) => {
    const time = date?.getTime();
    if (date && time && !isNaN(time)) {
      const dateString = date.toISOString();
      setRange('custom');
      switch (type) {
        case 'start':
          // Set picker start date only if input date is after zero time
          if (
            DateTime.fromISO(dateString).startOf('day') >=
            DateTime.fromMillis(0).startOf('day')
          ) {
            setPickerStartDate(
              DateTime.fromISO(dateString).startOf('day').toISOString(),
            );
          }
          break;
        case 'end':
          // Set picker end date only if input date is before today
          if (
            DateTime.fromISO(dateString).endOf('day') <=
            DateTime.now().endOf('day')
          ) {
            setPickerEndDate(
              DateTime.fromISO(dateString).endOf('day').toISOString(),
            );
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
            data: timeSeriesDataRanges?.bottomTemperature?.find(
              (x) => x.type === 'spotter',
            )?.data,
          },
          {
            name: 'HOBO',
            data: timeSeriesDataRanges?.bottomTemperature?.find(
              (x) => x.type === 'hobo',
            )?.data,
          },
        ]}
        timeZone={site.timezone}
        chartWidth={findChartWidth(tempAnalysisDatasets)}
        site={site}
        datasets={tempAnalysisDatasets}
        pointId={pointId ? parseInt(pointId, 10) : undefined}
        pickerStartDate={
          pickerStartDate ||
          DateTime.fromISO(today).minus({ weeks: 1 }).toISOString()
        }
        pickerEndDate={pickerEndDate || today}
        chartStartDate={chartStartDate}
        chartEndDate={chartEndDate}
        onStartDateChange={onPickerDateChange('start')}
        onEndDateChange={onPickerDateChange('end')}
        isPickerErrored={pickerErrored}
        areSurveysFiltered={surveysFiltered}
        source="spotter"
      />
      {[
        ...spotterDatasets(),
        ...sondeDatasets(),
        ...metlogDatasets(),
        ...huiDatasets(),
        ...seaphoxDatasets(),
      ].map(({ key, title, surveyPoint, source, rangeLabel, dataset }) => (
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
                name: rangeLabel,
                data: timeSeriesDataRanges?.[camelCase(key) as Metrics]?.find(
                  (x) => x.type === source,
                )?.data,
              },
            ]}
            timeZone={site.timezone}
            showRangeButtons={false}
            chartWidth="large"
            site={site}
            pickerStartDate={
              pickerStartDate ||
              DateTime.fromISO(today).minus({ weeks: 1 }).toISOString()
            }
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
            source={source}
          />
        </Box>
      ))}
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
                  pickerStartDate ||
                  DateTime.fromISO(today).minus({ weeks: 1 }).toISOString()
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
    </Container>
  );
}

interface MultipleSensorsChartsProps {
  site: Site;
  pointId?: string;
  surveysFiltered: boolean;
  disableGutters: boolean;
  displayOceanSenseCharts?: boolean;
  hasAdditionalSensorData: boolean;
}

export default MultipleSensorsCharts;
