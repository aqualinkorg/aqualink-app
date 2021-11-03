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
  Theme,
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
  generateHistoricalMonthlyMeanTimestamps,
} from "../../../helpers/dates";
import {
  DailyData,
  Site,
  SofarValue,
  TimeSeries,
} from "../../../store/Sites/types";
import {
  siteOceanSenseDataLoadingSelector,
  siteTimeSeriesDataLoadingSelector,
  siteTimeSeriesDataRangeLoadingSelector,
  siteTimeSeriesDataRangeSelector,
} from "../../../store/Sites/selectedSiteSlice";
import { findChartPeriod, moreThanOneYear } from "./helpers";
import { surveyListSelector } from "../../../store/Survey/surveyListSlice";
import { filterSurveys } from "../../../helpers/surveys";

const Chart = ({
  site,
  dailyData,
  pointId,
  displayHistoricalMonthlyMean,
  spotterData,
  hoboBottomTemperature,
  oceanSenseData,
  oceanSenseDataUnit,
  hideYAxisUnits,
  pickerStartDate,
  pickerEndDate,
  startDate,
  endDate,
  surveysFiltered,
  pickerErrored,
  showDatePickers,
  onStartDateChange,
  onEndDateChange,
  classes,
}: ChartProps) => {
  const theme = useTheme();
  const oceanSenseDataLoading = useSelector(siteOceanSenseDataLoadingSelector);
  const { bottomTemperature: hoboBottomTemperatureRange } =
    useSelector(siteTimeSeriesDataRangeSelector)?.hobo || {};
  const { minDate, maxDate } = hoboBottomTemperatureRange?.[0] || {};
  const isTimeSeriesDataRangeLoading = useSelector(
    siteTimeSeriesDataRangeLoadingSelector
  );
  const isTimeSeriesDataLoading = useSelector(
    siteTimeSeriesDataLoadingSelector
  );
  const surveys = filterSurveys(
    useSelector(surveyListSelector),
    "any",
    surveysFiltered ? pointId || -1 : -1
  );

  const dailyDataSst = dailyData?.map((item) => ({
    timestamp: item.date,
    value: item.satelliteTemperature,
  }));

  const hasSpotterBottom = !!spotterData?.bottomTemperature?.[1];
  const hasSpotterTop = !!spotterData?.topTemperature?.[1];
  const hasSpotterData = hasSpotterBottom || hasSpotterTop;

  const hasHoboData = !!hoboBottomTemperature?.[1];

  const hasOceanSenseData = !!oceanSenseData?.[1];

  const hasDailyData = !!dailyDataSst?.[1];

  const loading =
    isTimeSeriesDataLoading ||
    isTimeSeriesDataRangeLoading ||
    (oceanSenseData && oceanSenseDataLoading);

  const success =
    !pickerErrored &&
    !loading &&
    (hasHoboData || hasSpotterData || hasDailyData || hasOceanSenseData);
  const warning =
    !pickerErrored &&
    !loading &&
    !hasHoboData &&
    !hasSpotterData &&
    !hasDailyData &&
    !hasOceanSenseData;

  const minDateLocal = displayTimeInLocalTimezone({
    isoDate: minDate,
    timeZone: site.timezone,
    format: "MM/DD/YYYY",
    displayTimezone: false,
  });
  const maxDateLocal = displayTimeInLocalTimezone({
    isoDate: maxDate,
    timeZone: site.timezone,
    format: "MM/DD/YYYY",
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
                  ? `No HOBO data available - data available from ${minDateLocal} to ${maxDateLocal}.`
                  : `No ${
                      oceanSenseData ? "Ocean Sense" : "Smart Buoy or HOBO"
                    } data available in this time range.`}
              </Typography>
            </Alert>
          </Box>
          {noDataMessage()}
        </>
      )}
      {success && (
        <ChartWithTooltip
          className={classes.chart}
          siteId={site.id}
          depth={site.depth}
          dailyData={convertDailyDataToLocalTime(
            dailyData || [],
            site.timezone
          )}
          spotterData={convertTimeSeriesToLocalTime(spotterData, site.timezone)}
          hoboBottomTemperatureData={convertSofarDataToLocalTime(
            hoboBottomTemperature || [],
            site.timezone
          )}
          historicalMonthlyMeanData={
            displayHistoricalMonthlyMean
              ? generateHistoricalMonthlyMeanTimestamps(
                  site.historicalMonthlyMean,
                  startDate,
                  endDate,
                  site.timezone
                )
              : undefined
          }
          oceanSenseData={oceanSenseData}
          oceanSenseDataUnit={oceanSenseDataUnit}
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
        <Grid container justify="center">
          <Grid
            className={classes.datePickersWrapper}
            item
            xs={12}
            container
            justify="space-between"
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
      height: 275,
      margin: `${theme.spacing(1)}px 0`,
    },

    datePickersWrapper: {
      margin: "0 7px 0 27px",
    },
  });

interface ChartIncomingProps {
  site: Site;
  pointId?: number;
  dailyData?: DailyData[];
  spotterData?: TimeSeries;
  hoboBottomTemperature?: SofarValue[];
  oceanSenseData?: SofarValue[];
  oceanSenseDataUnit?: string;
  hideYAxisUnits?: boolean;
  displayHistoricalMonthlyMean?: boolean;
  pickerStartDate: string;
  pickerEndDate: string;
  startDate: string;
  endDate: string;
  pickerErrored: boolean;
  surveysFiltered?: boolean;
  showDatePickers?: boolean;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
}

Chart.defaultProps = {
  pointId: undefined,
  dailyData: [],
  spotterData: undefined,
  hoboBottomTemperature: undefined,
  oceanSenseData: undefined,
  oceanSenseDataUnit: undefined,
  hideYAxisUnits: false,
  displayHistoricalMonthlyMean: true,
  surveysFiltered: undefined,
  showDatePickers: true,
};

type ChartProps = ChartIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Chart);
