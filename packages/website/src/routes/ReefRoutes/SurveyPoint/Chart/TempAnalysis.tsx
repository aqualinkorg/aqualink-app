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
} from "@material-ui/core";
import moment from "moment";
import { useSelector } from "react-redux";

import { reefSpotterDataLoadingSelector } from "../../../../store/Reefs/selectedReefSlice";
import {
  DailyData,
  SofarValue,
  SpotterData,
} from "../../../../store/Reefs/types";
import { calculateCardMetrics } from "./helpers";
import { filterDailyData } from "../../../../common/Chart/utils";

const TempAnalysis = ({
  startDate,
  endDate,
  depth,
  spotterData,
  dailyData,
  hoboBottomTemperature,
  classes,
}: TempAnalysisProps) => {
  const spotterDataLoading = useSelector(reefSpotterDataLoadingSelector);
  const filteredDailyData = filterDailyData(dailyData, startDate, endDate);
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
    hoboBottomTemperature
  );
  const formattedStartDate = moment(startDate).format("MM/DD/YYYY");
  const formattedEndDate = moment(endDate).format("MM/DD/YYYY");
  const hasHoboData = hoboBottomTemperature.length > 0;
  const hasSpotterData =
    spotterData && spotterData.bottomTemperature.length > 0;

  return (
    <Card className={classes.tempAnalysisCard}>
      <Typography variant="subtitle1" color="textSecondary">
        TEMP ANALYSIS
      </Typography>
      <Typography className={classes.dates} variant="subtitle2">
        {formattedStartDate} - {formattedEndDate}
      </Typography>
      <Grid
        className={classes.metricsWrapper}
        container
        justify="space-between"
        alignItems="flex-end"
      >
        {spotterDataLoading ? (
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
              <Grid container direction="column" item spacing={3}>
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
              <Grid container direction="column" item spacing={3}>
                <Grid item>
                  <Typography className={classes.buoyText} variant="subtitle2">
                    {hasSpotterData && !hasHoboData ? `BUOY ${depth}m` : "HOBO"}
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
  );
};

const styles = () =>
  createStyles({
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
  startDate: string;
  endDate: string;
  depth: number | null;
  spotterData: SpotterData | null | undefined;
  dailyData: DailyData[];
  hoboBottomTemperature: SofarValue[];
}

type TempAnalysisProps = TempAnalysisIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(TempAnalysis);
