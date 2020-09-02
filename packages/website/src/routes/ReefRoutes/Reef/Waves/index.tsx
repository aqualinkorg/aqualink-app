import React from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Theme,
  Card,
  CardContent,
  Typography,
  Grid,
} from "@material-ui/core";

import type { Data } from "../../../../store/Reefs/types";
import { sortDailyData } from "../../../../helpers/sortDailyData";
import { formatNumber } from "../../../../helpers/numberUtils";
import waves from "../../../../assets/waves.svg";
import arrow from "../../../../assets/directioncircle.svg";
import wind from "../../../../assets/wind.svg";

const Waves = ({ dailyData, classes }: WavesProps) => {
  const sortByDate = sortDailyData(dailyData, "desc");
  const {
    maxWaveHeight,
    waveDirection,
    wavePeriod,
    maxWindSpeed,
    windDirection,
  } = sortByDate[0];

  return (
    <Card className={classes.card}>
      <CardContent className={classes.contentWrapper}>
        <Grid
          className={classes.content}
          style={{ height: "100%" }}
          container
          justify="center"
          item
          xs={12}
        >
          <Grid
            container
            alignItems="center"
            justify="space-between"
            item
            xs={12}
          >
            <Grid item xs={2}>
              <Typography className={classes.cardTitle} variant="h6">
                WIND
              </Typography>
            </Grid>
            <Grid item xs={9}>
              <img alt="wind" src={wind} />
            </Grid>
          </Grid>
          <Grid container justify="flex-start" item xs={12}>
            <Grid item xs={6}>
              <Typography
                className={classes.contentTitles}
                color="textSecondary"
                variant="subtitle2"
              >
                SPEED
              </Typography>
              <Grid container alignItems="baseline">
                <Typography
                  className={classes.contentValues}
                  color="textSecondary"
                >
                  {formatNumber(maxWindSpeed, 1)}
                </Typography>
                {maxWindSpeed && (
                  <Typography
                    className={classes.contentUnits}
                    color="textSecondary"
                    variant="h6"
                  >
                    KM/H
                  </Typography>
                )}
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Typography
                className={classes.contentTitles}
                color="textSecondary"
                variant="subtitle2"
              >
                DIRECTION
              </Typography>
              <Grid container alignItems="baseline">
                {windDirection && (
                  <img
                    style={{ transform: `rotate(${windDirection}deg)` }}
                    className={classes.arrow}
                    alt="arrow"
                    src={arrow}
                  />
                )}
                <Typography
                  className={classes.contentValues}
                  color="textSecondary"
                  variant="h3"
                >
                  {windDirection ? `${windDirection}\u00B0` : "- -"}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid
            container
            alignItems="center"
            justify="space-between"
            item
            xs={12}
          >
            <Grid item xs={2}>
              <Typography className={classes.cardTitle} variant="h6">
                WAVES
              </Typography>
            </Grid>
            <Grid item xs={9}>
              <img alt="waves" src={waves} />
            </Grid>
          </Grid>
          <Grid item xs={12} container justify="space-between">
            <Grid item lg={4}>
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
                  {formatNumber(maxWaveHeight, 1)}
                </Typography>
                {maxWaveHeight && (
                  <Typography
                    className={classes.contentUnits}
                    color="textSecondary"
                    variant="h6"
                  >
                    Μ
                  </Typography>
                )}
              </Grid>
            </Grid>
            <Grid item lg={4}>
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
                    className={classes.contentUnits}
                    color="textSecondary"
                    variant="h6"
                  >
                    S
                  </Typography>
                )}
              </Grid>
            </Grid>
            <Grid item lg={4}>
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
    cardTitle: {
      lineHeight: 1.5,
      color: theme.palette.primary.main,
    },
    contentWrapper: {
      flex: "1 1 auto",
      padding: 0,
    },
    content: {
      padding: "1rem",
    },
    contentTitles: {
      lineHeight: 1.33,
    },
    contentValues: {
      fontSize: 42,
      [theme.breakpoints.between("md", "lg")]: {
        fontSize: 32,
      },
      marginRight: "0.25rem",
      fontWeight: 300,
    },
    contentUnits: {
      [theme.breakpoints.between("md", "lg")]: {
        fontSize: 12,
      },
    },
    arrow: {
      width: 20,
      height: 20,
      [theme.breakpoints.between("md", "lg")]: {
        width: 14,
        height: 14,
      },
    },
  });

interface WavesIncomingProps {
  dailyData: Data[];
}

type WavesProps = WithStyles<typeof styles> & WavesIncomingProps;

export default withStyles(styles)(Waves);
