import React from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Card,
  CardContent,
  Typography,
  CardHeader,
  Grid,
} from "@material-ui/core";

import type { Data } from "../../../../store/Reefs/types";
import { sortDailyData } from "../../../../helpers/sortDailyData";
import { formatNumber } from "../../../../helpers/numberUtils";
import waves from "../../../../assets/waves.svg";
import wave from "../../../../assets/wave.svg";
import arrow from "../../../../assets/arrow.svg";

const Waves = ({ dailyData, classes }: WavesProps) => {
  const sortByDate = sortDailyData(dailyData, "desc");
  const { maxWaveHeight, waveDirection, wavePeriod } = sortByDate[0];

  return (
    <Card className={classes.card}>
      <CardHeader
        className={classes.header}
        title={
          <Grid container justify="flex-end">
            <Grid item xs={2}>
              <img alt="waves" src={waves} />
            </Grid>
          </Grid>
        }
      />
      <CardContent className={classes.contentWrapper}>
        <Grid
          className={classes.content}
          style={{ height: "100%" }}
          container
          justify="space-between"
        >
          <Grid container item xs={12} spacing={4}>
            <Grid item xs={12}>
              <Typography
                className={classes.contentTitles}
                color="textSecondary"
                variant="subtitle2"
              >
                HEIGHT
              </Typography>
              <Grid container alignItems="baseline">
                <Typography
                  className={classes.contentValues}
                  style={{ fontSize: 42, marginRight: "0.25rem" }}
                  color="textSecondary"
                >
                  {formatNumber(maxWaveHeight, 1)}
                </Typography>
                <Typography
                  style={{ fontWeight: "normal" }}
                  className={classes.contentUnits}
                  color="textSecondary"
                  variant="h6"
                >
                  Μ
                </Typography>
              </Grid>
            </Grid>
            <Grid container item xs={12}>
              <Grid item xs={4}>
                <Typography
                  className={classes.contentTitles}
                  color="textSecondary"
                  variant="subtitle2"
                >
                  PERIOD
                </Typography>
                <Grid container alignItems="baseline">
                  <Typography
                    className={classes.contentValues}
                    color="textSecondary"
                    variant="h3"
                  >
                    {wavePeriod}
                  </Typography>
                  <Typography
                    style={{ fontWeight: "normal" }}
                    className={classes.contentUnits}
                    color="textSecondary"
                    variant="h6"
                  >
                    S
                  </Typography>
                </Grid>
              </Grid>
              <Grid item xs={8}>
                <Typography
                  className={classes.contentTitles}
                  color="textSecondary"
                  variant="subtitle2"
                >
                  DIRECTION
                </Typography>
                <Grid container alignItems="baseline">
                  <img
                    style={{ transform: `rotate(${waveDirection}deg)` }}
                    className={classes.arrow}
                    alt="arrow"
                    src={arrow}
                  />
                  <Typography
                    className={classes.contentValues}
                    color="textSecondary"
                    variant="h3"
                  >
                    {waveDirection}&#176;
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid container item xs={12} alignItems="flex-end" justify="center">
            <img alt="wave" src={wave} />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const styles = () =>
  createStyles({
    card: {
      height: "100%",
      width: "100%",
      backgroundColor: "#eff0f0",
      display: "flex",
      flexDirection: "column",
    },
    header: {
      flex: "0 1 auto",
      padding: "1rem 0 0 0",
    },
    contentWrapper: {
      flex: "1 1 auto",
      padding: 0,
    },
    content: {
      padding: "0 2rem 2rem 2rem",
    },
    contentTitles: {
      fontWeight: "normal",
      fontStretch: "normal",
      fontStyle: "normal",
      lineHeight: 1.33,
      letterSpacing: "normal",
    },
    contentValues: {
      fontWeight: 300,
      fontStretch: "normal",
      fontStyle: "normal",
      lineHeight: "normal",
      letterSpacing: "normal",
    },
    contentUnits: {
      fontWeight: "normal",
      fontStretch: "normal",
      fontStyle: "normal",
      lineHeight: "normal",
      letterSpacing: "normal",
    },
    arrow: {
      width: 23,
      height: 23,
      marginRight: "0.5rem",
    },
  });

interface WavesIncomingProps {
  dailyData: Data[];
}

type WavesProps = WithStyles<typeof styles> & WavesIncomingProps;

export default withStyles(styles)(Waves);
