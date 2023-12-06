import {
  Backdrop,
  Button,
  CircularProgress,
  Grid,
  makeStyles,
  TextField,
} from '@material-ui/core';
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import React from 'react';
import { DateTime } from 'luxon';
import { useSelector } from 'react-redux';
import { userInfoSelector } from 'store/User/userSlice';
import { useSnackbar } from 'notistack';
import monitoringServices, {
  GetMonitoringMetricsResponse,
  MonitoringData,
} from 'services/monitoringServices';
import ChartWithTooltip from 'common/Chart/ChartWithTooltip';
import { Dataset } from 'common/Chart';
import { ArrayElement } from 'utils/types';
import { ValueWithTimestamp } from 'store/Sites/types';
import OneColorSwitch from 'common/OneColorSwitch';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { Link } from 'react-router-dom';

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
    label: 'time series requests',
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
  const milliseconds = +new Date(maxDate) - +new Date(minDate);

  const dataDuration = milliseconds / ONE_DAY;

  if (dataDuration <= 30) {
    return 'day';
  }
  return undefined;
}

function SiteMetrics() {
  const user = useSelector(userInfoSelector);
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const [siteId, setSiteId] = React.useState<string>('');
  const [spotterId, setSpotterId] = React.useState<string>('');
  const [monthly, setMonthly] = React.useState<boolean>(false);
  const [startDate, setStartDate] = React.useState<Date | null>(
    DateTime.now().minus({ months: 3 }).toJSDate(),
  );
  const [endDate, setEndDate] = React.useState<Date | null>(
    DateTime.now().toJSDate(),
  );
  const [result, setResult] = React.useState<GetMonitoringMetricsResponse>([]);
  const [loading, setLoading] = React.useState<boolean>(false);

  async function search() {
    const { token } = user || {};
    if (!token) {
      enqueueSnackbar('User is not authenticated!', {
        variant: 'error',
      });
      return;
    }

    setResult([]);

    setLoading(true);
    try {
      const { data } = await monitoringServices.getMonitoringStats({
        token,
        ...(siteId && { siteIds: [siteId] }),
        ...(spotterId && { spotterId }),
        monthly,
        start: startDate?.toISOString(),
        end: endDate?.toISOString(),
      });

      setResult(data);
    } catch (error: any) {
      enqueueSnackbar(error?.response?.data?.message || 'Request failed', {
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Backdrop open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Link to="/monitoring">
        <Button
          variant="outlined"
          color="primary"
          className={classes.button}
          startIcon={<ArrowBackIcon />}
        >
          Go back
        </Button>
      </Link>

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
            onChange={(e) => setStartDate(e)}
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
            onChange={(e) => setEndDate(e)}
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
              onChange={(e) => {
                setMonthly(e.target.checked);
              }}
              name="checkedC"
            />
          </Grid>
          <Grid item>monthly</Grid>
        </Grid>
      </div>

      <Button
        color="primary"
        variant="outlined"
        onClick={() => search()}
        className={classes.button}
      >
        get metrics
      </Button>
      <div className={classes.resultsContainer}>
        {result?.[0] && (
          <ChartWithTooltip
            className={classes.chart}
            siteId={Number(siteId)}
            surveys={[]}
            datasets={transformToDatasets(result[0])}
            temperatureThreshold={null}
            maxMonthlyMean={null}
            background
            hideYAxisUnits
            chartPeriod={getChartPeriod(result[0])}
          />
        )}
      </div>
    </div>
  );
}

const useStyles = makeStyles(() => ({
  chart: {
    margin: '0 2rem 0 2rem',
    width: '100%',
    height: '16rem',
    marginBottom: '3rem',
    marginTop: '1rem',
  },
  resultsContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '8rem',
    width: '100%',
  },
  optionsContainer: {
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    width: '30rem',
  },
  button: {
    margin: '1rem',
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
