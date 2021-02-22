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
import { useSelector } from "react-redux";

import ChartWithTooltip from "../../../../common/Chart/ChartWithTooltip";
import DatePicker from "../../../../common/Datepicker";
import {
  convertDailyDataToLocalTime,
  convertSpotterDataToLocalTime,
} from "../../../../helpers/dates";
import { Reef, SpotterData } from "../../../../store/Reefs/types";
import { reefSpotterDataLoadingSelector } from "../../../../store/Reefs/selectedReefSlice";

const Chart = ({
  reef,
  spotterData,
  pickerStartDate,
  pickerEndDate,
  onStartDateChange,
  onEndDateChange,
  classes,
}: ChartProps) => {
  const isSpotterDataLoading = useSelector(reefSpotterDataLoadingSelector);
  const hasSpotterDataSuccess =
    !isSpotterDataLoading &&
    spotterData &&
    spotterData.bottomTemperature.length > 1;
  const hasSpotterDataErrored = !isSpotterDataLoading && !hasSpotterDataSuccess;

  return (
    <>
      <Box ml="50px">
        <Typography variant="h6" color="textSecondary">
          TEMPERATURE
        </Typography>
      </Box>
      {isSpotterDataLoading && (
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
      {hasSpotterDataSuccess && (
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
            surveys={[]}
            temperatureThreshold={null}
            maxMonthlyMean={null}
            background
            chartPeriod="day"
            timeZone={reef.timezone}
          />
        </Box>
      )}
      {hasSpotterDataErrored && (
        <Box height="240px" mt="32px">
          <Typography>
            No Smart Buoy data available in this time range.
          </Typography>
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
  pickerStartDate: string;
  pickerEndDate: string;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
}

type ChartProps = ChartIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Chart);
