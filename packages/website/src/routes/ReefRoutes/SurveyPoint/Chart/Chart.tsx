import React from "react";
import {
  Box,
  Typography,
  Grid,
  withStyles,
  WithStyles,
  createStyles,
  CircularProgress,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { useSelector } from "react-redux";

import ChartWithTooltip from "../../../../common/Chart/ChartWithTooltip";
import DatePicker from "../../../../common/Datepicker";
import {
  convertDailyDataToLocalTime,
  convertHoboDataToLocalTime,
  convertSpotterDataToLocalTime,
  convertToLocalTime,
  displayTimeInLocalTimezone,
  generateMonthlyMaxTimestamps,
} from "../../../../helpers/dates";
import { Reef, SofarValue, SpotterData } from "../../../../store/Reefs/types";
import {
  reefHoboDataLoadingSelector,
  reefHoboDataRangeLoadingSelector,
  reefHoboDataRangeSelector,
  reefSpotterDataLoadingSelector,
} from "../../../../store/Reefs/selectedReefSlice";
import { findChartPeriod, showYear } from "./helpers";
import { surveyListSelector } from "../../../../store/Survey/surveyListSlice";
import { filterSurveys } from "../../../../helpers/surveys";
import { filterDailyData } from "../../../../common/Chart/utils";

const Chart = ({
  reef,
  pointId,
  spotterData,
  hoboBottomTemperature,
  pickerStartDate,
  pickerEndDate,
  startDate,
  endDate,
  error,
  onStartDateChange,
  onEndDateChange,
  classes,
}: ChartProps) => {
  const { bottomTemperature: hoboBottomTemperatureRange } =
    useSelector(reefHoboDataRangeSelector) || {};
  const { minDate, maxDate } =
    (hoboBottomTemperatureRange &&
      hoboBottomTemperatureRange.length > 0 &&
      hoboBottomTemperatureRange[0]) ||
    {};
  const ishoboDataRangeLoading = useSelector(reefHoboDataRangeLoadingSelector);
  const isSpotterDataLoading = useSelector(reefSpotterDataLoadingSelector);
  const isHoboDataLoading = useSelector(reefHoboDataLoadingSelector);
  const surveys = filterSurveys(
    useSelector(surveyListSelector),
    "any",
    pointId
  );

  const hasSpotterData =
    spotterData && spotterData.bottomTemperature.length > 1;

  const hasHoboData = hoboBottomTemperature && hoboBottomTemperature.length > 1;

  const hasDailyData =
    filterDailyData(reef.dailyData, startDate, endDate).length > 1;

  const loading =
    isSpotterDataLoading || isHoboDataLoading || ishoboDataRangeLoading;

  const success =
    !error && !loading && (hasHoboData || hasSpotterData || hasDailyData);
  const warning = !error && !loading && !hasHoboData && !hasSpotterData;

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

  return (
    <>
      <Box ml="50px">
        <Typography variant="h6" color="textSecondary">
          TEMPERATURE
        </Typography>
      </Box>
      {loading && (
        <Box
          height="240px"
          mt="32px"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <CircularProgress size="120px" thickness={1} />
        </Box>
      )}
      {error && (
        <Box mt="16px" mb="188px">
          <Alert severity="error">
            <Typography>Start Date should not be after End Date</Typography>
          </Alert>
        </Box>
      )}
      {warning && (
        <Box mt="16px" mb={success ? "0px" : "188px"}>
          <Alert severity="warning">
            <Typography>
              {minDateLocal && maxDateLocal
                ? `No HOBO data available - data available between ${minDateLocal} and ${maxDateLocal}.`
                : "No Smart Buoy or HOBO data available in this time range."}
            </Typography>
          </Alert>
        </Box>
      )}
      {success && (
        <Box>
          <ChartWithTooltip
            className={classes.chart}
            reefId={reef.id}
            depth={reef.depth}
            dailyData={convertDailyDataToLocalTime(
              reef.dailyData,
              reef.timezone
            )}
            spotterData={convertSpotterDataToLocalTime(
              spotterData || {
                bottomTemperature: [],
                surfaceTemperature: [],
              },
              reef.timezone
            )}
            hoboBottomTemperature={convertHoboDataToLocalTime(
              hoboBottomTemperature || [],
              reef.timezone
            )}
            monthlyMax={generateMonthlyMaxTimestamps(
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
            showYear={showYear(startDate, endDate)}
            extendDailyData={!hasHoboData}
          />
        </Box>
      )}
      {!ishoboDataRangeLoading && (
        <Grid container justify="center">
          <Grid item xs={11} container justify="space-between" spacing={1}>
            <Grid item>
              <DatePicker
                value={pickerStartDate}
                dateName="START DATE"
                nameVariant="subtitle1"
                pickerSize="small"
                maxDate={new Date(pickerEndDate)}
                autoOk={false}
                onChange={onStartDateChange}
              />
            </Grid>
            <Grid item>
              <DatePicker
                value={pickerEndDate}
                dateName="END DATE"
                nameVariant="subtitle1"
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
      height: 300,
      marginBottom: "3rem",
      marginTop: "1rem",
    },
  });

interface ChartIncomingProps {
  reef: Reef;
  pointId: number;
  spotterData: SpotterData | null | undefined;
  hoboBottomTemperature: SofarValue[] | undefined;
  pickerStartDate: string;
  pickerEndDate: string;
  startDate: string;
  endDate: string;
  error: boolean;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
}

type ChartProps = ChartIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Chart);
