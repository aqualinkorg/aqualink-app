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
import wind from "../../../../assets/wind.svg";
import clouds from "../../../../assets/clouds.svg";
import arrow from "../../../../assets/directioncircle.svg";

const Wind = ({ dailyData, classes }: WindProps) => {
  const sortByDate = sortDailyData(dailyData, "desc");
  const { maxWindSpeed, windDirection } = sortByDate[0];

  return (
    <Card className={classes.card}>
      <CardHeader
        className={classes.header}
        title={
          <Grid container justify="flex-end">
            <Grid item xs={2}>
              <img alt="wind" src={wind} />
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
          <Grid container item xs={6}>
            <Grid item xs={12}>
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
                  style={{ fontSize: 42, marginRight: "0.25rem" }}
                  color="textSecondary"
                >
                  {maxWindSpeed ? `${formatNumber(maxWindSpeed, 1)}` : "- -"}
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
            <Grid item xs={12}>
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
          <Grid container item xs={5} alignItems="flex-end">
            <img alt="clouds" src={clouds} />
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
      padding: "0 0 2rem 2rem",
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

interface WindIncomingProps {
  dailyData: Data[];
}

type WindProps = WithStyles<typeof styles> & WindIncomingProps;

export default withStyles(styles)(Wind);
