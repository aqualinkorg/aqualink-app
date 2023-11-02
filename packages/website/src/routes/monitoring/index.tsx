import React from 'react';
import NavBar from 'common/NavBar';
import Footer from 'common/Footer';
import {
  Backdrop,
  Button,
  CircularProgress,
  createStyles,
  Grid,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  WithStyles,
  withStyles,
} from '@material-ui/core';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import { useSelector } from 'react-redux';
import { userInfoSelector } from 'store/User/userSlice';
import monitoringServices, {
  GetMonitoringMetricsResponse,
  MonitoringData,
} from 'services/monitoringServices';
import { Dataset } from 'common/Chart';
import { ValueWithTimestamp } from 'store/Sites/types';
import ChartWithTooltip from 'common/Chart/ChartWithTooltip';
import { ArrayElement } from 'utils/types';

type SearchMethod = 'siteId' | 'spotterId';

const CustomSwitch = withStyles((theme) => ({
  switchBase: {
    color: theme.palette.primary.main,
    '&$checked': {
      color: theme.palette.primary.main,
    },
    '&$checked + $track': {
      backgroundColor: theme.palette.primary.main,
    },
    '& + $track': {
      backgroundColor: theme.palette.primary.main,
    },
  },
  checked: {},
  track: {},
}))(Switch);

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

function Monitoring({ classes }: MonitoringProps) {
  const { enqueueSnackbar } = useSnackbar();
  const user = useSelector(userInfoSelector);

  const [monthlyReportRequest, setMonthlyReportRequest] =
    React.useState<boolean>(false);
  const [searchMethod, setSearchMethod] =
    React.useState<SearchMethod>('siteId');
  const [loading, setLoading] = React.useState<boolean>(false);
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

  React.useEffect(() => {
    setResult([]);
  }, [monthlyReportRequest]);

  function handleSearchMethod(
    event: React.MouseEvent<HTMLElement>,
    val: string | null,
  ) {
    if (val === null) return;
    setSearchMethod(val as SearchMethod);
  }

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
      const { data } = monthlyReportRequest
        ? await monitoringServices.getMonitoringLastMonth({ token })
        : await monitoringServices.getMonitoringStats({
            token,
            ...(searchMethod === 'siteId'
              ? { siteIds: [siteId] || undefined }
              : { spotterId: spotterId || undefined }),
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
    <>
      <Backdrop open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <NavBar searchLocation={false} />
      <div style={{ height: '100%', display: 'flex', flexDirection: 'row' }}>
        <div
          style={{
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            width: '30rem',
          }}
        >
          {user && user.adminLevel === 'super_admin' && (
            <Grid component="label" container alignItems="center" spacing={1}>
              <Grid item xs={12}>
                <Typography variant="h5">Select Request Type</Typography>
              </Grid>
              <Grid item>Site Specific</Grid>
              <Grid item>
                <CustomSwitch
                  checked={monthlyReportRequest}
                  onChange={(e) => {
                    setMonthlyReportRequest(e.target.checked);
                  }}
                  name="checkedC"
                />
              </Grid>
              <Grid item>Monthly Report</Grid>
            </Grid>
          )}
          {monthlyReportRequest === false && (
            <>
              <div>
                <Typography>Search with:</Typography>
                <ToggleButtonGroup
                  exclusive
                  value={searchMethod}
                  onChange={(e, v) => handleSearchMethod(e, v)}
                >
                  <ToggleButton value="siteId">Site ID</ToggleButton>
                  <ToggleButton value="spotterId">Spotter ID</ToggleButton>
                </ToggleButtonGroup>
              </div>

              <div>
                {searchMethod === 'siteId' ? (
                  <TextField
                    variant="outlined"
                    label="Site ID"
                    value={siteId}
                    onChange={(e) => setSiteId(e.target.value)}
                  />
                ) : (
                  <TextField
                    variant="outlined"
                    label="Spotter ID"
                    value={spotterId}
                    onChange={(e) => setSpotterId(e.target.value)}
                  />
                )}
              </div>

              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                  disableToolbar
                  format="MM/dd/yyyy"
                  autoOk
                  size="small"
                  fullWidth
                  showTodayButton
                  value={startDate}
                  onChange={(e) => setStartDate(e)}
                  label="start date"
                  inputVariant="outlined"
                />
              </MuiPickersUtilsProvider>

              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                  disableToolbar
                  format="MM/dd/yyyy"
                  autoOk
                  size="small"
                  fullWidth
                  showTodayButton
                  value={endDate}
                  onChange={(e) => setEndDate(e)}
                  label="end date"
                  inputVariant="outlined"
                />
              </MuiPickersUtilsProvider>

              <Grid component="label" container alignItems="center" spacing={1}>
                <Grid item>weekly</Grid>
                <Grid item>
                  <CustomSwitch
                    checked={monthly}
                    onChange={(e) => {
                      setMonthly(e.target.checked);
                    }}
                    name="checkedC"
                  />
                </Grid>
                <Grid item>monthly</Grid>
              </Grid>
            </>
          )}

          <Button color="primary" variant="outlined" onClick={() => search()}>
            get metrics
          </Button>
        </div>
        <div className={classes.resultsContainer}>
          {monthlyReportRequest ? (
            <TableContainer style={{ width: '80%' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell className={classes.headCell}>Site ID</TableCell>
                    <TableCell className={classes.headCell} align="right">
                      Site Name
                    </TableCell>
                    <TableCell className={classes.headCell} align="right">
                      Total Requests
                    </TableCell>
                    <TableCell className={classes.headCell} align="right">
                      Registered Users Requests
                    </TableCell>
                    <TableCell className={classes.headCell} align="right">
                      Site Admins Requests
                    </TableCell>
                    <TableCell className={classes.headCell} align="right">
                      Time Series Requests
                    </TableCell>
                    <TableCell className={classes.headCell} align="right">
                      CSV Download Requests
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result.map((row) => (
                    <TableRow key={row.siteId}>
                      <TableCell
                        className={classes.cell}
                        component="th"
                        scope="row"
                      >
                        {row.siteId}
                      </TableCell>
                      <TableCell className={classes.cell} align="right">
                        {row.siteName}
                      </TableCell>
                      <TableCell className={classes.cell} align="right">
                        {row.data[0].totalRequests}
                      </TableCell>
                      <TableCell className={classes.cell} align="right">
                        {row.data[0].registeredUserRequests}
                      </TableCell>
                      <TableCell className={classes.cell} align="right">
                        {row.data[0].siteAdminRequests}
                      </TableCell>
                      <TableCell className={classes.cell} align="right">
                        {row.data[0].timeSeriesRequests}
                      </TableCell>
                      <TableCell className={classes.cell} align="right">
                        {row.data[0].CSVDownloadRequests}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

const styles = () =>
  createStyles({
    chart: {
      width: '80%',
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
    headCell: {
      fontWeight: 'bold',
      color: 'black',
    },
    cell: {
      color: 'black',
    },
  });

type MonitoringProps = WithStyles<typeof styles>;

export default withStyles(styles)(Monitoring);
