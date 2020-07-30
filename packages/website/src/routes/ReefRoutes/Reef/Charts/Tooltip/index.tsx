import React from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Card,
  CardHeader,
  CardContent,
  Grid,
  Box,
  Typography,
} from "@material-ui/core";
import { formatNumber } from "../../../../../helpers/numberUtils";

const Tooltip = ({
  date,
  bottomTemperature,
  surfaceTemperature,
  wave,
  waveDirection,
  wavePeriod,
  wind,
  windDirection,
  classes,
}: TooltipProps) => {
  // Remove seconds from date
  const dateWithoutSeconds = new Date(date)
    .toLocaleString()
    .replace(/:\d{2}\s/, " ");
  const splitDate = dateWithoutSeconds.split(", ");

  return (
    <Card className={classes.tooltip}>
      <CardHeader
        className={classes.tooltipHeader}
        title={
          <Grid
            alignItems="center"
            justify="space-between"
            item
            container
            xs={12}
          >
            <Grid item>
              <Typography color="textPrimary" variant="caption">
                {splitDate[0]}
              </Typography>
            </Grid>
            <Grid item>
              <Typography color="textPrimary" variant="caption">
                {splitDate[1]}
              </Typography>
            </Grid>
          </Grid>
        }
      />
      <CardContent className={classes.tooltipContent}>
        <Grid
          style={{ height: "100%" }}
          item
          container
          direction="row"
          justify="space-between"
        >
          <Grid
            container
            justify="space-between"
            alignItems="center"
            item
            xs={12}
          >
            <Grid container justify="flex-start" item xs={6}>
              <Typography variant="caption">TEMP AT 25M</Typography>
              <Typography variant="h5">
                {formatNumber(bottomTemperature, 1)} &#8451;
              </Typography>
            </Grid>
            <Grid container justify="flex-end" item xs={6}>
              <Typography variant="caption">SURFACE TEMP</Typography>
              <Typography variant="h5">
                {formatNumber(surfaceTemperature, 1)} &#8451;
              </Typography>
            </Grid>
          </Grid>
          <Grid container direction="column" item xs={12}>
            <Typography variant="caption">WIND</Typography>
            <Typography className={classes.tooltipContentRow} component="div">
              <Box>
                <Typography variant="h5">{formatNumber(wind, 1)}</Typography>
              </Box>
              <Box ml={0.2}>
                <Typography variant="subtitle2">kph</Typography>
              </Box>
              <Box ml={0.5}>
                <Typography variant="caption">FROM</Typography>
              </Box>
              <Box ml={0.5}>
                <Typography variant="h5">
                  {formatNumber(windDirection, 0)}&#176;
                </Typography>
              </Box>
            </Typography>
          </Grid>
          <Grid container direction="column" item xs={12}>
            <Typography variant="caption">WAVES</Typography>
            <Typography className={classes.tooltipContentRow} component="div">
              <Box>
                <Typography variant="h5">{formatNumber(wave, 1)}</Typography>
              </Box>
              <Box ml={0.2}>
                <Typography variant="subtitle2">m</Typography>
              </Box>
              <Box ml={0.5}>
                <Typography variant="caption">AT</Typography>
              </Box>
              <Box ml={0.5}>
                <Typography variant="h5">
                  {formatNumber(wavePeriod, 0)}
                </Typography>
              </Box>
              <Box ml={0.2}>
                <Typography variant="subtitle2">s</Typography>
              </Box>
              <Box ml={0.5}>
                <Typography variant="overline">FROM</Typography>
              </Box>
              <Box ml={0.5}>
                <Typography variant="h5">
                  {formatNumber(waveDirection, 0)} &#176;
                </Typography>
              </Box>
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const styles = () =>
  createStyles({
    tooltip: {
      height: 230,
      width: 240,
      display: "flex",
      flexFlow: "column",
      backgroundColor: "#404b6b",
      opacity: 0.9,
    },
    tooltipHeader: {
      flex: "0 1 auto",
      padding: "0.5rem 2rem 0.5rem 2rem",
    },
    tooltipContent: {
      flex: "1 1 auto",
      padding: "0.5rem 2rem 0.5rem 2rem",
    },
    tooltipContentRow: {
      display: "flex",
      alignItems: "baseline",
    },
  });

export interface TooltipData {
  date: string;
  bottomTemperature: number;
  surfaceTemperature: number;
  wind: number;
  windDirection: number;
  wave: number;
  wavePeriod: number;
  waveDirection: number;
}

type TooltipProps = TooltipData & WithStyles<typeof styles>;

export default withStyles(styles)(Tooltip);
