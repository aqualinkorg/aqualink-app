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
} from "../../../../helpers/dates";
import { Reef, SofarValue, SpotterData } from "../../../../store/Reefs/types";
import {
  reefHoboDataLoadingSelector,
  reefSpotterDataLoadingSelector,
} from "../../../../store/Reefs/selectedReefSlice";

const Chart = ({
  reef,
  spotterData,
  hoboBottomTemperature,
  pickerStartDate,
  pickerEndDate,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  classes,
}: ChartProps) => {
  const isSpotterDataLoading = useSelector(reefSpotterDataLoadingSelector);
  const isHoboDataLoading = useSelector(reefHoboDataLoadingSelector);

  const hasSpotterData =
    spotterData && spotterData.bottomTemperature.length > 1;

  const hasHoboData = hoboBottomTemperature && hoboBottomTemperature.length > 1;

  const loading = isSpotterDataLoading || isHoboDataLoading;
  const success = !loading && (hasHoboData || hasSpotterData);
  const error = !loading && !success;

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
            hoboData={convertHoboDataToLocalTime(
              hoboBottomTemperature || [],
              reef.timezone
            )}
            surveys={[]}
            temperatureThreshold={null}
            maxMonthlyMean={null}
            background
            chartPeriod="day"
            timeZone={reef.timezone}
            startDate={convertToLocalTime(startDate, reef.timezone)}
            endDate={convertToLocalTime(endDate, reef.timezone)}
          />
        </Box>
      )}
      {error && (
        <Box height="240px" mt="32px">
          <Alert severity="warning">
            <Typography>
              No Smart Buoy or HOBO data available in this time range.
            </Typography>
          </Alert>
        </Box>
      )}
      <Grid container justify="center">
        <Grid item xs={11} container justify="space-between" spacing={1}>
          <Grid item>
            <DatePicker
              value={pickerStartDate}
              dateName="START DATE"
              nameVariant="subtitle1"
              pickerSize="small"
              maxDate={new Date(pickerEndDate)}
              onChange={onStartDateChange}
            />
          </Grid>
          <Grid item>
            <DatePicker
              value={pickerEndDate}
              dateName="END DATE"
              nameVariant="subtitle1"
              pickerSize="small"
              onChange={onEndDateChange}
            />
          </Grid>
        </Grid>
      </Grid>
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
  spotterData: SpotterData | null | undefined;
  hoboBottomTemperature: SofarValue[] | undefined;
  pickerStartDate: string;
  pickerEndDate: string;
  startDate: string;
  endDate: string;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
}

type ChartProps = ChartIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Chart);
