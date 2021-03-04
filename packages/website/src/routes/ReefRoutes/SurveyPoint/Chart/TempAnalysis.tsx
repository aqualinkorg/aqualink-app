import React from "react";
import {
  Box,
  Card,
  Grid,
  Typography,
  withStyles,
  WithStyles,
  createStyles,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@material-ui/core";
import moment from "moment";
import { useSelector } from "react-redux";

import {
  reefHoboDataLoadingSelector,
  reefSpotterDataLoadingSelector,
} from "../../../../store/Reefs/selectedReefSlice";
import {
  DailyData,
  SofarValue,
  SpotterData,
} from "../../../../store/Reefs/types";
import { calculateCardMetrics } from "./helpers";
import { filterDailyData } from "../../../../common/Chart/utils";

const TempAnalysis = ({
  pickerStartDate,
  pickerEndDate,
  chartStartDate,
  chartEndDate,
  depth,
  spotterData,
  dailyData,
  hoboBottomTemperature,
  error,
  classes,
}: TempAnalysisProps) => {
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down("sm"));
  const spotterDataLoading = useSelector(reefSpotterDataLoadingSelector);
  const hoboDataLoading = useSelector(reefHoboDataLoadingSelector);

  const loading = spotterDataLoading || hoboDataLoading;

  const filteredDailyData = filterDailyData(
    dailyData,
    chartStartDate,
    chartEndDate
  );

  const hasDailyData = filteredDailyData.length > 0;
  const hasHoboData = hoboBottomTemperature.length > 1;
  const hasSpotterData =
    spotterData && spotterData.bottomTemperature.length > 1;

  const {
    maxSurface,
    meanSurface,
    minSurface,
    maxBottom,
    meanBottom,
    minBottom,
  } = calculateCardMetrics(
    filteredDailyData,
    spotterData,
    hoboBottomTemperature,
    error
  );

  const formattedpickerStartDate = moment(pickerStartDate).format("MM/DD/YYYY");
  const formattedpickerEndDate = moment(pickerEndDate).format("MM/DD/YYYY");

  return (
    <Box
      mt={
        !isTablet && !loading && hasDailyData && !hasSpotterData && !hasHoboData
          ? "115px"
          : "0px"
      }
    >
      <Card className={classes.tempAnalysisCard}>
        <Typography variant="subtitle1" color="textSecondary">
          TEMP ANALYSIS
        </Typography>
        <Typography className={classes.dates} variant="subtitle2">
          {formattedpickerStartDate} - {formattedpickerEndDate}
        </Typography>
        <Grid
          className={classes.metricsWrapper}
          container
          justify="space-between"
          alignItems="flex-end"
        >
          {loading ? (
            <Box
              height="100%"
              width="100%"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <CircularProgress size="120px" thickness={1} />
            </Box>
          ) : (
            <>
              <Grid item>
                <Grid
                  className={classes.metrics}
                  container
                  direction="column"
                  item
                  spacing={3}
                >
                  <Grid className={classes.rotatedText} item>
                    <Typography variant="caption" color="textSecondary">
                      MAX
                    </Typography>
                  </Grid>
                  <Grid className={classes.rotatedText} item>
                    <Typography variant="caption" color="textSecondary">
                      MEAN
                    </Typography>
                  </Grid>
                  <Grid className={classes.rotatedText} item>
                    <Typography variant="caption" color="textSecondary">
                      MIN
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item>
                <Grid
                  className={classes.autoWidth}
                  container
                  direction="column"
                  item
                  spacing={3}
                >
                  <Grid item>
                    <Typography
                      className={classes.surfaceText}
                      variant="subtitle2"
                    >
                      SURFACE
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography
                      className={classes.values}
                      variant="h5"
                      color="textSecondary"
                    >
                      {maxSurface} °C
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography
                      className={classes.values}
                      variant="h5"
                      color="textSecondary"
                    >
                      {meanSurface} °C
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography
                      className={classes.values}
                      variant="h5"
                      color="textSecondary"
                    >
                      {minSurface} °C
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item>
                <Grid
                  className={classes.autoWidth}
                  container
                  direction="column"
                  item
                  spacing={3}
                >
                  <Grid item>
                    <Typography
                      className={classes.buoyText}
                      variant="subtitle2"
                    >
                      {hasSpotterData && !hasHoboData
                        ? `BUOY ${depth}m`
                        : "HOBO"}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography
                      className={classes.values}
                      variant="h5"
                      color="textSecondary"
                    >
                      {maxBottom} °C
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography
                      className={classes.values}
                      variant="h5"
                      color="textSecondary"
                    >
                      {meanBottom} °C
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography
                      className={classes.values}
                      variant="h5"
                      color="textSecondary"
                    >
                      {minBottom} °C
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </>
          )}
        </Grid>
      </Card>
    </Box>
  );
};

const styles = () =>
  createStyles({
    autoWidth: {
      width: "auto",
    },
    tempAnalysisCard: {
      padding: 16,
      height: 265,
      marginTop: 45,
      backgroundColor: "#f8f9f9",
    },
    dates: {
      color: "#979797",
    },
    rotatedText: {
      transform: "rotate(-90deg)",
    },
    metricsWrapper: {
      height: "75%",
    },
    metrics: {
      position: "relative",
      bottom: 7,
      width: "auto",
    },
    surfaceText: {
      color: "#70c2e0",
      lineHeight: "17px",
    },
    buoyText: {
      color: "#f78c21",
      lineHeight: "17px",
    },
    values: {
      fontWeight: 300,
    },
  });

interface TempAnalysisIncomingProps {
  pickerStartDate: string;
  pickerEndDate: string;
  chartStartDate: string;
  chartEndDate: string;
  depth: number | null;
  spotterData: SpotterData | null | undefined;
  dailyData: DailyData[];
  hoboBottomTemperature: SofarValue[];
  error: boolean;
}

type TempAnalysisProps = TempAnalysisIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(TempAnalysis);
