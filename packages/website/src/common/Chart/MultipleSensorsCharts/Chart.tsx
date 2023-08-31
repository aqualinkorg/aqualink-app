import React from 'react';
import {
  Box,
  Typography,
  Grid,
  withStyles,
  WithStyles,
  createStyles,
  CircularProgress,
  useTheme,
  Theme,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { useSelector } from 'react-redux';

import { Site, Sources } from 'store/Sites/types';
import {
  siteTimeSeriesDataLoadingSelector,
  siteTimeSeriesDataRangeLoadingSelector,
  siteTimeSeriesDataRangeSelector,
} from 'store/Sites/selectedSiteSlice';
import { surveyListSelector } from 'store/Survey/surveyListSlice';
import { convertToLocalTime, displayTimeInLocalTimezone } from 'helpers/dates';
import { filterSurveys } from 'helpers/surveys';
import ChartWithTooltip from '../ChartWithTooltip';
import DatePicker from '../../Datepicker';
import { findChartPeriod, moreThanOneYear } from './helpers';
import { Dataset } from '..';

const Chart = ({
  datasets,
  site,
  pointId,
  hideYAxisUnits,
  pickerStartDate,
  pickerEndDate,
  startDate,
  endDate,
  surveysFiltered,
  pickerErrored,
  showDatePickers,
  source,
  onStartDateChange,
  onEndDateChange,
  classes,
}: ChartProps) => {
  const theme = useTheme();
  const dataRanges = useSelector(siteTimeSeriesDataRangeSelector) || {};
  const someMetricRangeWithCurrentSource =
    source && Object.values(dataRanges).find((x) => x[source] !== undefined);
  const { minDate, maxDate } =
    (someMetricRangeWithCurrentSource &&
      someMetricRangeWithCurrentSource[source]?.data?.[0]) ||
    {};

  const isTimeSeriesDataRangeLoading = useSelector(
    siteTimeSeriesDataRangeLoadingSelector,
  );
  const isTimeSeriesDataLoading = useSelector(
    siteTimeSeriesDataLoadingSelector,
  );
  const surveys = filterSurveys(
    useSelector(surveyListSelector),
    'any',
    surveysFiltered ? pointId || -1 : -1,
  );

  const hasData = datasets.some(({ displayData }) => displayData);

  const loading = isTimeSeriesDataLoading || isTimeSeriesDataRangeLoading;

  const success = !pickerErrored && !loading && hasData;
  const warning = !pickerErrored && !loading && !hasData;

  const minDateLocal = displayTimeInLocalTimezone({
    isoDate: minDate,
    timeZone: site.timezone,
    format: 'MM/DD/YYYY',
    displayTimezone: false,
  });
  const maxDateLocal = displayTimeInLocalTimezone({
    isoDate: maxDate,
    timeZone: site.timezone,
    format: 'MM/DD/YYYY',
    displayTimezone: false,
  });

  const noDataMessage = () => (
    <Box
      margin="8px 0"
      height="215px"
      display="flex"
      justifyContent="center"
      alignItems="center"
      textAlign="center"
      color={theme.palette.primary.main}
    >
      <Typography variant="h2">No data to display</Typography>
    </Box>
  );

  return (
    <>
      {loading && (
        <Box
          height="275px"
          mt="8px"
          mb="8px"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <CircularProgress size="120px" thickness={1} />
        </Box>
      )}
      {pickerErrored && (
        <>
          <Box mt="8px">
            <Alert severity="error">
              <Typography>Start Date should not be after End Date</Typography>
            </Alert>
          </Box>
          {noDataMessage()}
        </>
      )}
      {warning && (
        <>
          <Box mt="8px">
            <Alert severity="warning">
              <Typography>
                {minDateLocal && maxDateLocal
                  ? `No ${source?.toUpperCase()} data available - data available from ${minDateLocal} to ${maxDateLocal}.`
                  : 'No data available in this time range.'}
              </Typography>
            </Alert>
          </Box>
          {noDataMessage()}
        </>
      )}
      {success && (
        <ChartWithTooltip
          className={classes.chart}
          datasets={datasets}
          siteId={site.id}
          hideYAxisUnits={hideYAxisUnits}
          surveys={surveys}
          temperatureThreshold={null}
          maxMonthlyMean={null}
          background
          chartPeriod={findChartPeriod(startDate, endDate)}
          timeZone={site.timezone}
          startDate={convertToLocalTime(startDate, site.timezone)}
          endDate={convertToLocalTime(endDate, site.timezone)}
          showYearInTicks={moreThanOneYear(startDate, endDate)}
          fill={false}
        />
      )}
      {!isTimeSeriesDataRangeLoading && showDatePickers && (
        <Grid container justifyContent="center">
          <Grid
            className={classes.datePickersWrapper}
            item
            xs={12}
            container
            justifyContent="space-between"
            spacing={1}
          >
            <Grid item>
              <DatePicker
                value={pickerStartDate}
                dateName="START DATE"
                dateNameTextVariant="subtitle1"
                pickerSize="small"
                autoOk={false}
                onChange={onStartDateChange}
                timeZone={site.timezone}
              />
            </Grid>
            <Grid item>
              <DatePicker
                value={pickerEndDate}
                dateName="END DATE"
                dateNameTextVariant="subtitle1"
                pickerSize="small"
                autoOk={false}
                onChange={onEndDateChange}
                timeZone={site.timezone}
              />
            </Grid>
          </Grid>
        </Grid>
      )}
    </>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    chart: {
      height: 279,
      margin: `${theme.spacing(1)}px 0`,
    },

    datePickersWrapper: {
      margin: '0 7px 0 27px',
    },
  });

interface ChartIncomingProps {
  site: Site;
  pointId?: number;
  datasets: Dataset[];
  hideYAxisUnits?: boolean;
  pickerStartDate: string;
  pickerEndDate: string;
  startDate: string;
  endDate: string;
  pickerErrored: boolean;
  surveysFiltered?: boolean;
  showDatePickers?: boolean;
  source?: Sources;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
}

Chart.defaultProps = {
  pointId: undefined,
  hideYAxisUnits: false,
  surveysFiltered: undefined,
  showDatePickers: true,
};

type ChartProps = ChartIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Chart);
