import React from "react";
import {
  Box,
  CircularProgress,
  createStyles,
  Grid,
  withStyles,
  WithStyles,
  Typography,
} from "@material-ui/core";
import { useSelector } from "react-redux";
import { some } from "lodash";

import { DailyData } from "../../../store/Reefs/types";
import { formatNumber } from "../../../helpers/numberUtils";
import {
  reefTimeSeriesDataLoadingSelector,
  reefTimeSeriesDataSelector,
} from "../../../store/Reefs/selectedReefSlice";
import { getCardTemperatureValues } from "./utils";

const ObservationBox = ({
  depth,
  dailyData,
  date,
  classes,
}: ObservationBoxProps) => {
  const { hobo: hoboData, spotter: spotterData } =
    useSelector(reefTimeSeriesDataSelector) || {};
  const loading = useSelector(reefTimeSeriesDataLoadingSelector);

  const {
    satelliteTemperature,
    hoboBottom,
    hoboSurface,
    spotterBottom,
    spotterTop,
  } = getCardTemperatureValues(dailyData, spotterData, hoboData, date);

  return (
    <div className={classes.outerDiv}>
      {loading ? (
        <Box
          height="204px"
          width="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <CircularProgress
            className={classes.loading}
            thickness={1}
            size="102px"
          />
        </Box>
      ) : (
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
            {some([hoboBottom, hoboSurface, spotterBottom, spotterTop]) && (
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
                      {`${formatNumber(spotterTop || hoboSurface, 1)} °C`}
                    </Typography>
                  </Grid>
                  <Grid container item direction="column" xs={6}>
                    <Typography color="textPrimary" variant="overline">
                      TEMP AT {depth ? `${depth}m` : "DEPTH"}
                    </Typography>
                    <Typography color="textPrimary" variant="h4">
                      {`${formatNumber(spotterBottom || hoboBottom, 1)} °C`}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            )}
          </Grid>
        </Grid>
      )}
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

    loading: {
      color: "#ffffff",
    },
  });

interface ObservationBoxIncomingProps {
  depth: number | null;
  dailyData: DailyData[];
  date?: string | null;
}

ObservationBox.defaultProps = {
  date: null,
};

type ObservationBoxProps = ObservationBoxIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(ObservationBox);
