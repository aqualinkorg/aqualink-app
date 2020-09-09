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
  Chip,
  Box,
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

  const metrics = [
    {
      label: "SURFACE TEMP",
      value: `${formatNumber(surfaceTemperature, 1)} °C`,
    },
    {
      label: `TEMP AT ${reef.depth}M`,
      value: `${formatNumber(avgBottomTemperature, 1)} °C`,
    },
  ];

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
        <Grid
          container
          alignItems="center"
          justify="space-between"
          spacing={1}
          style={{ position: "relative" }}
        >
          <Grid container direction="column" spacing={3} item xs={7}>
            {metrics.map(({ label, value }) => (
              <Grid key={label} item>
                <Box pl="1rem">
                  <Typography
                    className={classes.contentTextTitles}
                    variant="subtitle2"
                  >
                    {label}
                  </Typography>
                  <Typography
                    className={classes.contentTextValues}
                    variant="h2"
                  >
                    {value}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          {!hasSpotter && (
            <Grid item xs={12}>
              <Chip
                className={classes.noSensorAlert}
                label="Not Installed Yet"
              />
            </Grid>
          )}
          <Box position="absolute" top={0} right={0}>
            <img alt="sensor" src={sensor} />
          </Box>
        </Grid>
      </CardContent>
    </Card>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    ...incomingStyles,
    card: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      backgroundColor: "#128cc0",
    },
    titleImage: {
      height: 35,
      width: 35,
    },
    header: {
      paddingBottom: 0,
    },
    content: {
      padding: "1rem 1rem 0 1rem",
      [theme.breakpoints.between("md", 1350)]: {
        padding: "1rem 1rem 0 1rem",
      },
    },
    noSensorAlert: {
      backgroundColor: "#edb86f",
      borderRadius: 4,
      color: "white",
    },
  });

interface SensorIncomingProps {
  reef: Reef;
}

type SensorProps = WithStyles<typeof styles> & SensorIncomingProps;

export default withStyles(styles)(Sensor);
