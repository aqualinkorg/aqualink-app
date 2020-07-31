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

import type { Reef } from "../../../../store/Reefs/types";
import sensor from "../../../../assets/sensor.svg";
import buoy from "../../../../assets/buoy.svg";

const Sensor = ({ reef, classes }: SensorProps) => {
  const sensorExists = false;

  return (
    <Card className={classes.card}>
      <CardHeader
        className={classes.header}
        title={
          <Grid container justify="space-between">
            {!sensorExists && (
              <Grid
                className={classes.noSensorAlert}
                container
                alignItems="center"
                justify="center"
                item
                xs={7}
              >
                <Typography variant="subtitle1" color="textPrimary">
                  Not Installed Yet
                </Typography>
              </Grid>
            )}
            <Grid item xs={1}>
              <img alt="buoy" src={buoy} />
            </Grid>
          </Grid>
        }
      />
      <CardContent className={classes.content}>
        <Grid
          style={{ height: "100%" }}
          container
          alignItems="center"
          justify="space-between"
        >
          <Grid
            className={classes.contentText}
            container
            direction="column"
            spacing={5}
            item
            xs={7}
          >
            <Grid item>
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
                variant="h2"
              >
                {sensorExists ? "0.0" : "- -"}
              </Typography>
            </Grid>
            <Grid item>
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
                variant="h2"
              >
                {sensorExists ? "0.0" : "- -"}
              </Typography>
            </Grid>
          </Grid>
          <Grid item xs={4}>
            <img alt="sensor" src={sensor} />
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
      backgroundColor: "#128cc0",
      display: "flex",
      flexDirection: "column",
    },
    header: {
      flex: "0 1 auto",
    },
    content: {
      flex: "1 1 auto",
      padding: "0 1rem 1rem 1rem",
    },
    noSensorAlert: {
      backgroundColor: "#edb86f",
      borderRadius: 4,
    },
    contentText: {
      paddingLeft: "1.5rem",
    },
    contentTextTitles: {
      fontWeight: "normal",
      fontStretch: "normal",
      fontStyle: "normal",
      lineHeight: 1.33,
      letterSpacing: "normal",
    },
    contentTextValues: {
      fontWeight: 300,
      fontStretch: "normal",
      fontStyle: "normal",
      lineHeight: "normal",
      letterSpacing: "normal",
    },
  });

interface SensorIncomingProps {
  reef: Reef;
}

type SensorProps = WithStyles<typeof styles> & SensorIncomingProps;

export default withStyles(styles)(Sensor);
