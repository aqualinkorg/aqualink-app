import React from "react";

import {
  createStyles,
  Grid,
  withStyles,
  WithStyles,
  Typography,
} from "@material-ui/core";
import { Data } from "../../../store/Reefs/types";
import { sortDailyData } from "../../../helpers/sortDailyData";

const ObservationBox = ({ depth, dailyData, classes }: ObservationBoxProps) => {
  const sortByDate = sortDailyData(dailyData);
  const dailyDataLen = sortByDate.length;
  const {
    avgBottomTemperature,
    surfaceTemperature,
    satelliteTemperature,
  } = sortByDate[dailyDataLen - 1];

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
                {`${satelliteTemperature} \u2103`}
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
                  SURFACE TEMP
                </Typography>
                <Typography color="textPrimary" variant="h4">
                  {`${surfaceTemperature} \u2103`}
                </Typography>
              </Grid>
              <Grid container item direction="column" xs={6}>
                <Typography color="textPrimary" variant="overline">
                  {`TEMP AT ${depth}M`}
                </Typography>
                <Typography color="textPrimary" variant="h4">
                  {`${avgBottomTemperature} \u2103`}
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
  dailyData: Data[];
}

type ObservationBoxProps = ObservationBoxIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(ObservationBox);
