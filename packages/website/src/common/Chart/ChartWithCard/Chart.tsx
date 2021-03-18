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
  convertHoboDataToLocalTime,
  convertSpotterDataToLocalTime,
  convertToLocalTime,
  displayTimeInLocalTimezone,
  generateMonthlyMaxTimestamps,
} from "../../../helpers/dates";
import { Reef, SofarValue, SpotterData } from "../../../store/Reefs/types";
import {
  reefHoboDataLoadingSelector,
  reefHoboDataRangeLoadingSelector,
  reefHoboDataRangeSelector,
  reefSpotterDataLoadingSelector,
} from "../../../store/Reefs/selectedReefSlice";
import { findChartPeriod, moreThanOneYear } from "./helpers";
import { surveyListSelector } from "../../../store/Survey/surveyListSlice";
import { filterSurveys } from "../../../helpers/surveys";

const Chart = ({
  reef,
  pointId,
  spotterData,
  hoboBottomTemperature,
  pickerStartDate,
  pickerEndDate,
  startDate,
  endDate,
  pickerErrored,
  onStartDateChange,
  onEndDateChange,
  classes,
}: ChartProps) => {
  const theme = useTheme();
  const { bottomTemperature: hoboBottomTemperatureRange } =
    useSelector(reefHoboDataRangeSelector) || {};
  const { minDate, maxDate } = hoboBottomTemperatureRange?.[0] || {};
  const isHoboDataRangeLoading = useSelector(reefHoboDataRangeLoadingSelector);
  const isSpotterDataLoading = useSelector(reefSpotterDataLoadingSelector);
  const isHoboDataLoading = useSelector(reefHoboDataLoadingSelector);
  const surveys = filterSurveys(
    useSelector(surveyListSelector),
    "any",
    pointId || -1
  );

  const hasSpotterBottom = !!spotterData?.bottomTemperature?.[1];
  const hasSpotterSurface = !!spotterData?.surfaceTemperature?.[1];
  const hasSpotterData = hasSpotterBottom || hasSpotterSurface;

  const hasHoboData = !!hoboBottomTemperature?.[1];

  const loading =
    isSpotterDataLoading || isHoboDataLoading || isHoboDataRangeLoading;

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
      mb="48px"
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
          mb="48px"
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
          dailyData={convertDailyDataToLocalTime(reef.dailyData, reef.timezone)}
          spotterData={convertSpotterDataToLocalTime(
            spotterData || {
              bottomTemperature: [],
              surfaceTemperature: [],
            },
            reef.timezone
          )}
          hoboBottomTemperatureData={convertHoboDataToLocalTime(
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
      {!isHoboDataRangeLoading && (
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
      marginBottom: 48,
      marginTop: 16,
    },
  });

interface ChartIncomingProps {
  reef: Reef;
  pointId: number | undefined;
  spotterData: SpotterData | null | undefined;
  hoboBottomTemperature: SofarValue[] | undefined;
  pickerStartDate: string;
  pickerEndDate: string;
  startDate: string;
  endDate: string;
  pickerErrored: boolean;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
}

type ChartProps = ChartIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Chart);
