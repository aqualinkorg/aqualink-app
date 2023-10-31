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
  TextField,
  Theme,
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

function transformToDatasets(
  siteInfo: ArrayElement<GetMonitoringMetricsResponse>,
): Dataset[] {
  const totalRequests: ValueWithTimestamp[] = siteInfo.data.map((x) => {
    return {
      value: x.totalRequests,
      timestamp: x.date,
    };
  });

  const totalRequestsDataset: Dataset = {
    label: 'total requests',
    data: totalRequests,
    type: 'line',
    unit: 'requests',
    curveColor: '#168dbd',
    displayData: true,
    considerForXAxisLimits: true,
  };

  return [totalRequestsDataset];
}

function Monitoring({ classes }: MonitoringProps) {
  const { enqueueSnackbar } = useSnackbar();
  const user = useSelector(userInfoSelector);

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
      const { data } = await monitoringServices.getMonitoringStats({
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
            width: '17rem',
          }}
        >
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

          <Button color="primary" variant="outlined" onClick={() => search()}>
            get metrics
          </Button>
        </div>
        <Grid
          className={classes.chartWrapper}
          container
          justifyContent="space-between"
          item
          spacing={1}
        >
          <Grid className={classes.chartContainer} item>
            {result?.[0] && (
              <ChartWithTooltip
                className={classes.chart}
                siteId={0}
                surveys={[]}
                datasets={transformToDatasets(result[0])}
                temperatureThreshold={null}
                maxMonthlyMean={null}
                background
                chartSettings={{
                  tooltips: {
                    enabled: false,
                    intersect: false,
                  },
                  legend: {
                    display: false,
                  },
                }}
                fill={false}
                hideYAxisUnits={false}
                showYearInTicks={false}
              />
            )}
          </Grid>
        </Grid>
      </div>
      <Footer />
    </>
  );
}

const styles = (theme: Theme) =>
  createStyles({
    chart: {
      height: 279,
      margin: `${theme.spacing(1)}px 0`,
    },
    chartWrapper: {
      marginBottom: 20,
      [theme.breakpoints.down('xs')]: {
        marginBottom: 10,
      },
    },
    chartContainer: {
      [theme.breakpoints.down('sm')]: {
        width: '100%',
      },
    },
  });

type MonitoringProps = WithStyles<typeof styles>;

export default withStyles(styles)(Monitoring);
