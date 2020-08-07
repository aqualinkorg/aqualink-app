import React from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Theme,
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
import arrow from "../../../../assets/directioncircle.svg";

const Waves = ({ dailyData, classes }: WavesProps) => {
  const sortByDate = sortDailyData(dailyData, "desc");
  const { maxWaveHeight, waveDirection, wavePeriod } = sortByDate[0];

  return (
    <Card className={classes.card}>
      <CardHeader
        className={classes.header}
        title={
          <Grid container justify="flex-start">
            <Grid item xs={2}>
              <img alt="waves" src={waves} />
            </Grid>
            <Grid item xs={8}>
              <Typography className={classes.cardTitle} variant="h6">
                WAVES
              </Typography>
            </Grid>
          </Grid>
        }
      />
      <CardContent className={classes.contentWrapper}>
        <Grid
          className={classes.content}
          style={{ height: "100%" }}
          container
          justify="center"
          item
          xs={12}
        >
          <Grid item xs={12} container justify="space-around">
            <Grid item xs={3}>
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
                  color="textSecondary"
                >
                  {maxWaveHeight ? `${formatNumber(maxWaveHeight, 1)}` : "- -"}
                </Typography>
                {maxWaveHeight && (
                  <Typography
                    style={{ fontWeight: "normal" }}
                    className={classes.contentUnits}
                    color="textSecondary"
                    variant="h6"
                  >
                    Μ
                  </Typography>
                )}
              </Grid>
            </Grid>
            <Grid item xs={3}>
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
                >
                  {wavePeriod || "- -"}
                </Typography>
                {wavePeriod && (
                  <Typography
                    style={{ fontWeight: "normal" }}
                    className={classes.contentUnits}
                    color="textSecondary"
                    variant="h6"
                  >
                    S
                  </Typography>
                )}
              </Grid>
            </Grid>
            <Grid item xs={5}>
              <Typography
                className={classes.contentTitles}
                color="textSecondary"
                variant="subtitle2"
              >
                DIRECTION
              </Typography>
              <Grid container alignItems="baseline">
                {waveDirection && (
                  <img
                    style={{ transform: `rotate(${waveDirection}deg)` }}
                    className={classes.arrow}
                    alt="arrow"
                    src={arrow}
                  />
                )}
                <Typography
                  className={classes.contentValues}
                  color="textSecondary"
                >
                  {waveDirection ? `${waveDirection}\u00B0` : "- -"}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid container justify="center" item xs={12}>
            <img alt="wave" src={wave} />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const styles = (theme: Theme) =>
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
      paddingLeft: "2rem",
      paddingBottom: 0,
    },
    cardTitle: {
      fontWeight: "normal",
      fontStretch: "normal",
      fontStyle: "normal",
      lineHeight: 1.5,
      letterSpacing: "normal",
      margin: "0 0 0.5rem 1rem",
      color: theme.palette.primary.main,
    },
    contentWrapper: {
      flex: "1 1 auto",
      padding: 0,
    },
    content: {
      padding: "5rem 1rem 1rem 1rem",
    },
    contentTitles: {
      fontWeight: "normal",
      fontStretch: "normal",
      fontStyle: "normal",
      lineHeight: 1.33,
      letterSpacing: "normal",
    },
    contentValues: {
      fontSize: 42,
      marginRight: "0.25rem",
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
