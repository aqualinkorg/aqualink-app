import React from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Card,
  CardContent,
  Typography,
  Box,
  CardHeader,
  Grid,
} from "@material-ui/core";
import ErrorIcon from "@material-ui/icons/Error";
import Alert from "@material-ui/lab/Alert";

import { SelectedReefState } from "../../../../store/Reefs/types";

const Temperature = ({ dailyData, classes }: TemperatureProps) => {
  const bottomTemperature = dailyData[0].bottomTemperature.max;
  const date = new Date(dailyData[0].date);

  const { surfaceTemperature, wind, waves } = dailyData[0];

  return (
    <Card className={classes.card}>
      <CardHeader
        className={classes.header}
        title={
          <Grid container alignItems="baseline">
            <Grid style={{ marginRight: "0.5rem" }} item>
              <Typography variant="h6">CURRENT CONDITIONS</Typography>
            </Grid>
            <Grid item>
              <Typography variant="subtitle2">{`(${date.toLocaleDateString(
                "en-US"
              )} 8:16AM PST)`}</Typography>
            </Grid>
          </Grid>
        }
      />
      <CardContent className={classes.content}>
        <Grid
          style={{ height: "100%", padding: "0 32px 0 32px" }}
          item
          xs={12}
          container
          direction="row"
          justify="flex-end"
          alignItems="flex-start"
        >
          <Grid
            item
            xs={12}
            container
            direction="row"
            justify="center"
            alignItems="center"
          >
            <Grid
              item
              xs={7}
              container
              direction="column"
              alignItems="flex-start"
            >
              <Typography variant="caption">TEMP AT 25M</Typography>
              {bottomTemperature && (
                <Typography variant="h2">
                  {bottomTemperature} &#8451;
                </Typography>
              )}
            </Grid>
            <Grid
              item
              xs={5}
              container
              direction="column"
              alignItems="flex-start"
              justify="space-between"
            >
              <Typography variant="caption">SURFACE TEMP</Typography>
              {surfaceTemperature && (
                <Typography gutterBottom variant="h5">
                  {surfaceTemperature} &#8451;
                </Typography>
              )}
              <Typography variant="caption">WIND</Typography>
              {wind && (
                <Typography
                  style={{ display: "flex", alignItems: "baseline" }}
                  component="div"
                >
                  <Box>
                    <Typography variant="h5">{wind.maxSpeed}</Typography>
                  </Box>
                  <Box ml={0}>
                    <Typography variant="subtitle2">kph</Typography>
                  </Box>
                  <Box ml={0.5}>
                    <Typography variant="caption">FROM</Typography>
                  </Box>
                  <Box ml={0.5}>
                    <Typography variant="h5">
                      {wind.direction} &#176;
                    </Typography>
                  </Box>
                </Typography>
              )}
            </Grid>
          </Grid>
          <Grid
            item
            xs={12}
            container
            direction="row"
            justify="center"
            alignItems="center"
          >
            <Grid
              item
              xs={7}
              container
              direction="column"
              alignItems="flex-start"
            >
              <Alert
                className={classes.alert}
                variant="filled"
                severity="warning"
                icon={<ErrorIcon />}
              >
                <Typography variant="caption">ALERT LEVEL: HIGH</Typography>
              </Alert>
            </Grid>
            <Grid
              item
              xs={5}
              container
              direction="column"
              alignItems="flex-start"
            >
              <Typography variant="caption">WAVES</Typography>
              {waves && (
                <Typography
                  style={{ display: "flex", alignItems: "baseline" }}
                  component="div"
                >
                  <Box>
                    <Typography variant="h5">{waves.speed}</Typography>
                  </Box>
                  <Box ml={0}>
                    <Typography variant="subtitle2">m</Typography>
                  </Box>
                  <Box ml={0.5}>
                    <Typography variant="caption">AT</Typography>
                  </Box>
                  <Box ml={0.5}>
                    <Typography variant="h5">{waves.period}</Typography>
                  </Box>
                  <Box ml={0.5}>
                    <Typography variant="subtitle2">S</Typography>
                  </Box>
                  <Box ml={0.5}>
                    <Typography variant="overline">FROM</Typography>
                  </Box>
                  <Box ml={0.5}>
                    <Typography variant="h5">
                      {waves.direction} &#176;
                    </Typography>
                  </Box>
                </Typography>
              )}
            </Grid>
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
      display: "flex",
      padding: "10px 32px 10px 32px",
    },
    content: {
      height: "100%",
      width: "100%",
      padding: 0,
      marginTop: "1rem",
    },
    alert: {
      height: 23,
      display: "flex",
      alignItems: "center",
    },
  });

interface TemperatureIncomingProps {
  dailyData: SelectedReefState["details"]["dailyData"];
}

type TemperatureProps = WithStyles<typeof styles> & TemperatureIncomingProps;

export default withStyles(styles)(Temperature);
