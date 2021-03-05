import React from "react";
import {
  createStyles,
  Grid,
  withStyles,
  WithStyles,
  Typography,
} from "@material-ui/core";
import { useSelector } from "react-redux";

import { DailyData } from "../../../store/Reefs/types";
import { getDailyDataClosestToDate } from "../../../helpers/sortDailyData";
import { formatNumber } from "../../../helpers/numberUtils";
import { isBetween } from "../../../helpers/dates";
import { reefHoboDataSelector } from "../../../store/Reefs/selectedReefSlice";
import { getSpotterDataClosestToDate } from "../../../common/Chart/utils";

const ObservationBox = ({
  depth,
  dailyData,
  date,
  classes,
}: ObservationBoxProps) => {
  const { bottomTemperature, surfaceTemperature } =
    useSelector(reefHoboDataSelector) || {};
  const dailyDataLen = dailyData.length;
  const surfaceData =
    dailyDataLen > 0 &&
    date &&
    isBetween(date, dailyData[dailyDataLen - 1].date, dailyData[0].date)
      ? getDailyDataClosestToDate(dailyData, new Date(date))
      : undefined;
  const { satelliteTemperature } = surfaceData || {};

  const hoboSurfaceData =
    date &&
    surfaceTemperature &&
    surfaceTemperature.length > 0 &&
    isBetween(
      date,
      surfaceTemperature[0].timestamp,
      surfaceTemperature[surfaceTemperature.length - 1].timestamp
    )
      ? getSpotterDataClosestToDate(surfaceTemperature, new Date(date), 6)
          ?.value
      : undefined;

  const hoboBottomData =
    date &&
    bottomTemperature &&
    bottomTemperature.length > 0 &&
    isBetween(
      date,
      bottomTemperature[0].timestamp,
      bottomTemperature[bottomTemperature.length - 1].timestamp
    )
      ? getSpotterDataClosestToDate(bottomTemperature, new Date(date), 6)?.value
      : undefined;

  return (
    <div className={classes.outerDiv}>
      <Grid container direction="column">
        <Grid container item direction="column" spacing={4}>
          <Grid container item direction="column" spacing={1}>
            <Grid item>
              <Typography color="textPrimary" variant="subtitle1">
                SATELLITE OBSERVATION
              </Typography>
            </Grid>
            <Grid container item direction="column">
              <Typography color="textPrimary" variant="overline">
                SURFACE TEMP
              </Typography>
              <Typography color="textPrimary" variant="h4">
                {`${formatNumber(satelliteTemperature, 1)} °C`}
              </Typography>
            </Grid>
          </Grid>
          <Grid container item direction="column" spacing={1}>
            <Grid item>
              <Typography color="textPrimary" variant="subtitle1">
                SENSOR OBSERVATION
              </Typography>
            </Grid>
            <Grid container item spacing={2}>
              <Grid container item direction="column" xs={6}>
                <Typography color="textPrimary" variant="overline">
                  TEMP AT 1m
                </Typography>
                <Typography color="textPrimary" variant="h4">
                  {`${formatNumber(hoboSurfaceData, 1)} °C`}
                </Typography>
              </Grid>
              <Grid container item direction="column" xs={6}>
                <Typography color="textPrimary" variant="overline">
                  TEMP AT {depth ? `${depth}m` : "DEPTH"}
                </Typography>
                <Typography color="textPrimary" variant="h4">
                  {`${formatNumber(hoboBottomData, 1)} °C`}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

const styles = () =>
  createStyles({
    outerDiv: {
      backgroundColor: "#128cc0",
      borderRadius: "0.4rem",
      display: "flex",
      padding: "1rem",
      flexGrow: 1,
    },
  });

interface ObservationBoxIncomingProps {
  depth: number | null;
  dailyData: DailyData[];
  date: string | null | undefined;
}

type ObservationBoxProps = ObservationBoxIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(ObservationBox);
