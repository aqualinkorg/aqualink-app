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

import { formatNumber } from "../../../../helpers/numberUtils";
import type { Reef } from "../../../../store/Reefs/types";
import sensor from "../../../../assets/sensor.svg";
import buoy from "../../../../assets/buoy.svg";
import { styles as incomingStyles } from "../styles";

const Sensor = ({ reef, classes }: SensorProps) => {
  const { surfaceTemperature, avgBottomTemperature } =
    reef.latestDailyData || {};

  const hasSpotter = Boolean(surfaceTemperature || avgBottomTemperature);

  return (
    <Card className={classes.card}>
      <CardHeader
        className={classes.header}
        title={
          <Grid container justify="space-between">
            <Grid item xs={8}>
              <Typography className={classes.cardTitle} variant="h6">
                SENSOR OBSERVATION
              </Typography>
            </Grid>
            <Grid item xs={1}>
              <img className={classes.titleImage} alt="buoy" src={buoy} />
            </Grid>
          </Grid>
        }
      />
      <CardContent className={classes.content}>
        <Grid style={{ height: "100%" }} container justify="space-between">
          <Grid alignContent="flex-start" container item xs={7}>
            <Grid className={classes.contentMeasure} item xs={12}>
              <Typography
                className={classes.contentTextTitles}
                color="textPrimary"
                variant="subtitle2"
              >
                SURFACE TEMP
              </Typography>
              <Typography
                className={classes.contentTextValues}
                color="textPrimary"
              >
                {formatNumber(surfaceTemperature, 1)} °C
              </Typography>
            </Grid>
            <Grid className={classes.contentMeasure} item xs={12}>
              <Typography
                className={classes.contentTextTitles}
                color="textPrimary"
                variant="subtitle2"
              >
                {`TEMP AT ${reef.depth}M`}
              </Typography>
              <Typography
                className={classes.contentTextValues}
                color="textPrimary"
              >
                {formatNumber(avgBottomTemperature, 1)} °C
              </Typography>
            </Grid>
            {!hasSpotter && (
              <Grid
                className={classes.noSensorAlert}
                container
                alignItems="center"
                justify="center"
                item
                xs={12}
              >
                <Typography
                  className={classes.alertText}
                  variant="subtitle1"
                  color="textPrimary"
                >
                  Not Installed Yet
                </Typography>
              </Grid>
            )}
          </Grid>
          <Grid container alignItems="flex-end" item xs={5}>
            <img className={classes.contentImage} alt="sensor" src={sensor} />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    ...incomingStyles,
    card: {
      height: "100%",
      width: "100%",
      backgroundColor: "#128cc0",
      display: "flex",
      flexDirection: "column",
    },
    titleImage: {
      height: 35,
      width: 35,
    },
    header: {
      flex: "0 1 auto",
      padding: "1rem 1rem 0 1rem",
    },
    content: {
      flex: "1 1 auto",
      padding: "1rem 1rem 0 1rem",
      [theme.breakpoints.between("md", 1350)]: {
        padding: "1rem 1rem 0 1rem",
      },
    },
    contentImage: {
      height: "75%",
    },
    noSensorAlert: {
      backgroundColor: "#edb86f",
      borderRadius: 4,
      height: "2rem",
      marginTop: "2rem",
      [theme.breakpoints.between("md", "lg")]: {
        marginTop: "3rem",
      },
    },
    alertText: {
      [theme.breakpoints.between("md", 1080)]: {
        fontSize: 11,
      },
    },
  });

interface SensorIncomingProps {
  reef: Reef;
}

type SensorProps = WithStyles<typeof styles> & SensorIncomingProps;

export default withStyles(styles)(Sensor);
