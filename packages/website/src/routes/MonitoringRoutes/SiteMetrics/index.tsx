import { Grid, makeStyles, TextField } from '@material-ui/core';
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import React from 'react';
import { DateTime } from 'luxon';
import monitoringServices, {
  GetMonitoringMetricsResponse,
  MonitoringData,
} from 'services/monitoringServices';
import ChartWithTooltip, {
  ChartWithTooltipProps,
} from 'common/Chart/ChartWithTooltip';
import { Dataset } from 'common/Chart';
import { ArrayElement } from 'utils/types';
import { ValueWithTimestamp } from 'store/Sites/types';
import OneColorSwitch from 'common/OneColorSwitch';
import MonitoringPageWrapper from '../MonitoringPageWrapper';

function transformToDatasets(
  siteInfo: ArrayElement<GetMonitoringMetricsResponse>,
): Dataset[] {
  const monitoringDataKeys: (keyof MonitoringData)[] = [
    'totalRequests',
    'registeredUserRequests',
    'siteAdminRequests',
    'timeSeriesRequests',
    'CSVDownloadRequests',
  ];

  const [
    totalRequests,
    registeredUserRequests,
    siteAdminRequests,
    timeSeriesRequests,
    CSVDownloadRequests,
  ]: ValueWithTimestamp[][] = monitoringDataKeys.map((key) =>
    siteInfo.data.map((x) => {
      return {
        value: Number(x[key]),
        timestamp: x.date,
      };
    }),
  );

  const totalRequestsDataset: Dataset = {
    label: 'total requests',
    data: totalRequests,
    type: 'line',
    unit: '',
    curveColor: '#168dbd',
    displayData: true,
    considerForXAxisLimits: true,
  };

  const registeredUserRequestsDataset: Dataset = {
    label: 'registered users requests',
    data: registeredUserRequests,
    type: 'line',
    unit: '',
    curveColor: 'red',
    displayData: true,
    considerForXAxisLimits: true,
  };

  const siteAdminRequestsDataset: Dataset = {
    label: 'site admin requests',
    data: siteAdminRequests,
    type: 'line',
    unit: '',
    curveColor: 'green',
    displayData: true,
    considerForXAxisLimits: true,
  };

  const timeSeriesRequestsDataset: Dataset = {
    label: 'dashboard visits',
    data: timeSeriesRequests,
    type: 'line',
    unit: '',
    curveColor: 'blue',
    displayData: true,
    considerForXAxisLimits: true,
  };

  const CSVDownloadRequestsDataset: Dataset = {
    label: 'CSV downloads requests',
    data: CSVDownloadRequests,
    type: 'line',
    unit: '',
    curveColor: 'black',
    displayData: true,
    considerForXAxisLimits: true,
  };

  return [
    totalRequestsDataset,
    registeredUserRequestsDataset,
    siteAdminRequestsDataset,
    timeSeriesRequestsDataset,
    CSVDownloadRequestsDataset,
  ];
}

const ONE_DAY = 24 * 60 * 60 * 1000; // One day in milliseconds

function getChartPeriod(siteInfo: ArrayElement<GetMonitoringMetricsResponse>) {
  const { data } = siteInfo;
  const maxDate = data.reduce(
    (max, curr) => (max > curr.date ? max : curr.date),
    new Date(0).toISOString(),
  );
  const minDate = data.reduce(
    (min, curr) => (min < curr.date ? min : curr.date),
    new Date().toISOString(),
  );

  if (minDate === undefined || maxDate === undefined) {
    return undefined;
  }

  const milliseconds =
    new Date(maxDate).getTime() - new Date(minDate).getTime();

  const dataDuration = milliseconds / ONE_DAY;

  if (dataDuration <= 30) {
    return 'day';
  }
  return undefined;
}

function SiteMetrics() {
  const classes = useStyles();

  const [siteId, setSiteId] = React.useState<string>('');
  const [spotterId, setSpotterId] = React.useState<string>('');
  const [monthly, setMonthly] = React.useState<boolean>(false);
  const [startDate, setStartDate] = React.useState<Date>(
    DateTime.now().minus({ months: 3 }).toJSDate(),
  );
  const [endDate, setEndDate] = React.useState<Date>(DateTime.now().toJSDate());

  React.useEffect(() => {
    setSpotterId('');
  }, [siteId]);

  React.useEffect(() => {
    setSiteId('');
  }, [spotterId]);

  const getResult = React.useCallback(
    async (token: string) =>
      (
        await monitoringServices.getMonitoringStats({
          token,
          ...(siteId && { siteIds: [siteId] }),
          ...(spotterId && { spotterId }),
          monthly,
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        })
      ).data,
    [endDate, monthly, siteId, spotterId, startDate],
  );

  const filters = (
    <div className={classes.filtersWrapper}>
      <TextField
        className={classes.filterItem}
        variant="outlined"
        label="Site ID"
        value={siteId}
        onChange={(e) => setSiteId(e.target.value)}
      />
      <TextField
        className={classes.filterItem}
        variant="outlined"
        label="Spotter ID"
        value={spotterId}
        onChange={(e) => setSpotterId(e.target.value)}
      />
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDatePicker
          className={classes.filterItem}
          disableToolbar
          format="MM/dd/yyyy"
          autoOk
          size="small"
          showTodayButton
          value={startDate}
          onChange={(e) => e && setStartDate(e)}
          label="start date"
          inputVariant="outlined"
        />
      </MuiPickersUtilsProvider>

      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDatePicker
          className={classes.filterItem}
          disableToolbar
          format="MM/dd/yyyy"
          autoOk
          size="small"
          showTodayButton
          value={endDate}
          onChange={(e) => e && setEndDate(e)}
          label="end date"
          inputVariant="outlined"
        />
      </MuiPickersUtilsProvider>

      <Grid
        container
        alignItems="center"
        spacing={1}
        className={classes.switchContainer}
      >
        <Grid item>weekly</Grid>
        <Grid item>
          <OneColorSwitch
            checked={monthly}
            onChange={(e: any) => {
              setMonthly(e.target.checked);
            }}
            name="checkedC"
          />
        </Grid>
        <Grid item>monthly</Grid>
      </Grid>
    </div>
  );

  return (
    <MonitoringPageWrapper<
      GetMonitoringMetricsResponse,
      React.PropsWithChildren<ChartWithTooltipProps>
    >
      pageTitle="Site Metrics"
      pageDescription="Use only one of Site ID or Spotter ID!"
      ResultsComponent={ChartWithTooltip}
      resultsComponentProps={(res) => ({
        className: classes.chart,
        siteId: Number(siteId),
        surveys: [],
        datasets: transformToDatasets(res[0]),
        temperatureThreshold: null,
        maxMonthlyMean: null,
        background: true,
        hideYAxisUnits: true,
        chartPeriod: getChartPeriod(res[0]),
      })}
      getResult={getResult}
      filters={filters}
      fetchOnEnter
      csvDownload={(token) =>
        monitoringServices.getMonitoringStatsCSV({
          token,
          ...(siteId && { siteIds: [siteId] }),
          ...(spotterId && { spotterId }),
          monthly,
          start: startDate?.toISOString(),
          end: endDate?.toISOString(),
        })
      }
    />
  );
}

const useStyles = makeStyles(() => ({
  chart: {
    width: '100%',
    height: '16rem',
    marginBottom: '3rem',
    marginTop: '1rem',
  },
  filtersWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: '2rem',
    padding: '2rem',
    flexBasis: '5rem',
  },
  switchContainer: {
    width: 'fit-content',
    height: '3rem',
  },
  filterItem: {
    height: '3rem',
  },
}));

export default SiteMetrics;
