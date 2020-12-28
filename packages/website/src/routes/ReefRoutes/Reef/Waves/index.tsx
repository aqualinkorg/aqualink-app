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

import UpdateInfo from "../../../../common/UpdateInfo";
import type { LiveData } from "../../../../store/Reefs/types";
import { formatNumber } from "../../../../helpers/numberUtils";
import { timeAgo } from "../../../../helpers/dates";
import waves from "../../../../assets/waves.svg";
import arrow from "../../../../assets/directioncircle.svg";
import wind from "../../../../assets/wind.svg";
import { styles as incomingStyles } from "../styles";

const Waves = ({ liveData, timeZone, classes }: WavesProps) => {
  const {
    waveHeight,
    waveDirection,
    wavePeriod,
    windSpeed,
    windDirection,
  } = liveData;

  const windAgo = timeAgo(windSpeed?.timestamp);

  const timestamp =
    waveHeight?.timestamp && timeZone
      ? new Date(waveHeight.timestamp)
          .toLocaleDateString("en-GB", {
            timeZone,
            timeZoneName: "short",
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })
          .replace(",", "")
      : null;

  return (
    <Card className={classes.card}>
      <CardContent className={classes.contentWrapper}>
        <Grid
          className={classes.content}
          container
          justify="center"
          item
          xs={12}
        >
          <Grid className={classes.paddingContainer} container item xs={12}>
            <Typography className={classes.cardTitle} variant="h6">
              WIND
            </Typography>
            <img className={classes.titleImages} alt="wind" src={wind} />
          </Grid>
          <Grid className={classes.paddingContainer} container item xs={12}>
            <Grid item xs={6}>
              <Typography
                className={classes.contentTextTitles}
                color="textSecondary"
                variant="subtitle2"
              >
                SPEED
              </Typography>
              <Grid container alignItems="baseline">
                <Typography
                  className={classes.contentTextValues}
                  color="textSecondary"
                  variant="h3"
                >
                  {formatNumber(windSpeed?.value, 1)}
                </Typography>
                {windSpeed?.value && (
                  <Typography
                    className={classes.contentUnits}
                    color="textSecondary"
                    variant="h6"
                  >
                    km/h
                  </Typography>
                )}
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Typography
                className={classes.contentTextTitles}
                color="textSecondary"
                variant="subtitle2"
              >
                DIRECTION
              </Typography>
              <Grid container alignItems="baseline">
                {windDirection?.value && (
                  <img
                    style={{
                      transform: `rotate(${windDirection?.value + 180}deg)`,
                    }}
                    className={classes.arrow}
                    alt="arrow"
                    src={arrow}
                  />
                )}
                <Typography
                  className={classes.contentTextValues}
                  color="textSecondary"
                  variant="h3"
                >
                  {windDirection?.value
                    ? `${formatNumber(windDirection?.value)}\u00B0`
                    : "- -"}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid className={classes.paddingContainer} container item xs={12}>
            <Typography className={classes.cardTitle} variant="h6">
              WAVES
            </Typography>
            <img className={classes.titleImages} alt="waves" src={waves} />
          </Grid>
          <Grid
            className={classes.paddingContainer}
            item
            xs={12}
            container
            justify="space-between"
          >
            <Grid item lg={4}>
              <Typography
                className={classes.contentTextTitles}
                color="textSecondary"
                variant="subtitle2"
              >
                HEIGHT
              </Typography>
              <Grid container alignItems="baseline">
                <Typography
                  className={classes.contentTextValues}
                  color="textSecondary"
                  variant="h3"
                >
                  {formatNumber(waveHeight?.value, 1)}
                </Typography>
                {waveHeight?.value && (
                  <Typography
                    className={classes.contentUnits}
                    color="textSecondary"
                    variant="h6"
                  >
                    m
                  </Typography>
                )}
              </Grid>
            </Grid>
            <Grid item lg={3}>
              <Typography
                className={classes.contentTextTitles}
                color="textSecondary"
                variant="subtitle2"
              >
                PERIOD
              </Typography>
              <Grid container alignItems="baseline">
                <Typography
                  className={classes.contentTextValues}
                  color="textSecondary"
                  variant="h3"
                >
                  {formatNumber(wavePeriod?.value)}
                </Typography>
                {wavePeriod?.value && (
                  <Typography
                    className={classes.contentUnits}
                    color="textSecondary"
                    variant="h6"
                  >
                    s
                  </Typography>
                )}
              </Grid>
            </Grid>
            <Grid item lg={5}>
              <Typography
                className={classes.contentTextTitles}
                color="textSecondary"
                variant="subtitle2"
              >
                DIRECTION
              </Typography>
              <Grid container alignItems="baseline">
                {waveDirection?.value && (
                  <img
                    style={{
                      transform: `rotate(${waveDirection?.value + 180}deg)`,
                    }}
                    className={classes.arrow}
                    alt="arrow"
                    src={arrow}
                  />
                )}
                <Typography
                  className={classes.contentTextValues}
                  color="textSecondary"
                  variant="h3"
                >
                  {formatNumber(waveDirection?.value)}
                  {waveDirection?.value ? "\u00B0" : ""}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          {(windSpeed || windDirection) && (
            <UpdateInfo
              timestamp={windAgo}
              timestampText="Last data received"
              image={null}
              imageText={null}
              live
              frequency="hourly"
              withBottomMargin={Boolean(
                waveHeight || wavePeriod || waveDirection
              )}
            />
          )}
          {(waveHeight || wavePeriod || waveDirection) && (
            <UpdateInfo
              timestamp={timestamp}
              timestampText="Forecast model valid for"
              image={null}
              imageText="NOAA GFS"
              live={false}
              frequency="hourly"
            />
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    ...incomingStyles,
    card: {
      ...incomingStyles.card,
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
    titleImages: {
      height: 24,
      marginLeft: "0.5rem",
    },
    paddingContainer: {
      padding: "0.5rem 1rem",
    },
    contentWrapper: {
      height: "100%",
      flex: "1 1 auto",
      padding: 0,
    },
    content: {
      height: "100%",
    },
    arrow: {
      width: 20,
      height: 20,
      marginRight: "1rem",
      marginBottom: 10,
      [theme.breakpoints.between("md", 1350)]: {
        width: 15,
        height: 15,
      },
    },
  });

interface WavesIncomingProps {
  liveData: LiveData;
  timeZone?: string | null;
}

Waves.defaultProps = {
  timeZone: null,
};

type WavesProps = WithStyles<typeof styles> & WavesIncomingProps;

export default withStyles(styles)(Waves);
