import React from "react";
import {
  Box,
  Typography,
  Grid,
  withStyles,
  WithStyles,
  createStyles,
  CircularProgress,
  useTheme,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { useSelector } from "react-redux";

import ChartWithTooltip from "../ChartWithTooltip";
import DatePicker from "../../Datepicker";
import {
  convertDailyDataToLocalTime,
  convertSofarDataToLocalTime,
  convertTimeSeriesToLocalTime,
  convertToLocalTime,
  displayTimeInLocalTimezone,
  generateMonthlyMaxTimestamps,
} from "../../../helpers/dates";
import {
  DailyData,
  Reef,
  SofarValue,
  TimeSeries,
} from "../../../store/Reefs/types";
import {
  reefTimeSeriesDataLoadingSelector,
  reefTimeSeriesDataRangeLoadingSelector,
  reefTimeSeriesDataRangeSelector,
} from "../../../store/Reefs/selectedReefSlice";
import { findChartPeriod, moreThanOneYear } from "./helpers";
import { surveyListSelector } from "../../../store/Survey/surveyListSlice";
import { filterSurveys } from "../../../helpers/surveys";

const Chart = ({
  reef,
  dailyData,
  pointId,
  spotterData,
  hoboBottomTemperature,
  pickerStartDate,
  pickerEndDate,
  startDate,
  endDate,
  surveysFiltered,
  pickerErrored,
  onStartDateChange,
  onEndDateChange,
  classes,
}: ChartProps) => {
  const theme = useTheme();
  const { bottomTemperature: hoboBottomTemperatureRange } =
    useSelector(reefTimeSeriesDataRangeSelector)?.hobo || {};
  const { minDate, maxDate } = hoboBottomTemperatureRange?.[0] || {};
  const isTimeSeriesDataRangeLoading = useSelector(
    reefTimeSeriesDataRangeLoadingSelector
  );
  const isTimeSeriesDataLoading = useSelector(
    reefTimeSeriesDataLoadingSelector
  );
  const surveys = filterSurveys(
    useSelector(surveyListSelector),
    "any",
    surveysFiltered ? pointId || -1 : -1
  );

  const hasSpotterBottom = !!spotterData?.bottomTemperature?.[1];
  const hasSpotterSurface = !!spotterData?.surfaceTemperature?.[1];
  const hasSpotterData = hasSpotterBottom || hasSpotterSurface;

  const hasHoboData = !!hoboBottomTemperature?.[1];

  const loading = isTimeSeriesDataLoading || isTimeSeriesDataRangeLoading;

  const success = !pickerErrored && !loading && (hasHoboData || hasSpotterData);
  const warning = !pickerErrored && !loading && !hasHoboData && !hasSpotterData;

  const minDateLocal = displayTimeInLocalTimezone({
    isoDate: minDate,
    timeZone: reef.timezone,
    format: "MM/DD/YYYY",
    displayTimezone: false,
  });
  const maxDateLocal = displayTimeInLocalTimezone({
    isoDate: maxDate,
    timeZone: reef.timezone,
    format: "MM/DD/YYYY",
    displayTimezone: false,
  });

  const noDataMessage = () => (
    <Box
      mt="16px"
      mb="16px"
      height="217px"
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
          height="285px"
          mt="16px"
          mb="16px"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <CircularProgress size="120px" thickness={1} />
        </Box>
      )}
      {pickerErrored && (
        <>
          <Box mt="16px">
            <Alert severity="error">
              <Typography>Start Date should not be after End Date</Typography>
            </Alert>
          </Box>
          {noDataMessage()}
        </>
      )}
      {warning && (
        <>
          <Box mt="16px">
            <Alert severity="warning">
              <Typography>
                {minDateLocal && maxDateLocal
                  ? `No HOBO data available - data available from ${minDateLocal} to ${maxDateLocal}.`
                  : "No Smart Buoy or HOBO data available in this time range."}
              </Typography>
            </Alert>
          </Box>
          {noDataMessage()}
        </>
      )}
      {success && (
        <ChartWithTooltip
          className={classes.chart}
          reefId={reef.id}
          depth={reef.depth}
          dailyData={convertDailyDataToLocalTime(dailyData, reef.timezone)}
          spotterData={convertTimeSeriesToLocalTime(spotterData, reef.timezone)}
          hoboBottomTemperatureData={convertSofarDataToLocalTime(
            hoboBottomTemperature || [],
            reef.timezone
          )}
          monthlyMaxData={generateMonthlyMaxTimestamps(
            reef.monthlyMax,
            startDate,
            endDate,
            reef.timezone
          )}
          surveys={surveys}
          temperatureThreshold={null}
          maxMonthlyMean={null}
          background
          chartPeriod={findChartPeriod(startDate, endDate)}
          timeZone={reef.timezone}
          startDate={convertToLocalTime(startDate, reef.timezone)}
          endDate={convertToLocalTime(endDate, reef.timezone)}
          showYearInTicks={moreThanOneYear(startDate, endDate)}
        />
      )}
      {!isTimeSeriesDataRangeLoading && (
        <Grid container justify="center">
          <Grid item xs={11} container justify="space-between" spacing={1}>
            <Grid item>
              <DatePicker
                value={pickerStartDate}
                dateName="START DATE"
                dateNameTextVariant="subtitle1"
                pickerSize="small"
                autoOk={false}
                onChange={onStartDateChange}
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
              />
            </Grid>
          </Grid>
        </Grid>
      )}
    </>
  );
};

const styles = () =>
  createStyles({
    chart: {
      height: 285,
      marginBottom: 16,
      marginTop: 16,
    },
  });

interface ChartIncomingProps {
  reef: Reef;
  pointId: number | undefined;
  dailyData: DailyData[];
  spotterData: TimeSeries | undefined;
  hoboBottomTemperature: SofarValue[] | undefined;
  pickerStartDate: string;
  pickerEndDate: string;
  startDate: string;
  endDate: string;
  pickerErrored: boolean;
  surveysFiltered: boolean;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
}

type ChartProps = ChartIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Chart);
