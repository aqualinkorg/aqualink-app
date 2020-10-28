import React from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Card,
  CardHeader,
  CardContent,
  Grid,
  Typography,
} from "@material-ui/core";
import { formatNumber } from "../../../helpers/numberUtils";

const Tooltip = ({
  date,
  depth,
  bottomTemperature,
  spotterSurfaceTemp,
  surfaceTemperature,
  classes,
}: TooltipProps) => {
  // Remove seconds from date
  const dateString = new Date(date).toLocaleString("en", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: spotterSurfaceTemp ? "2-digit" : undefined,
    minute: spotterSurfaceTemp ? "2-digit" : undefined,
  });

  const TemperatureMetric = (
    temperature: number,
    title: string,
    spacing: 6 | 12,
    gridClassName: string | undefined
  ) => (
    <Grid item xs={spacing} className={gridClassName}>
      <Grid container justify="flex-start" item>
        <Typography variant="caption">{title}</Typography>
      </Grid>
      <Grid container justify="flex-start" item>
        <Typography variant="h5">
          {`${formatNumber(temperature, 1)} °C`}
        </Typography>
      </Grid>
    </Grid>
  );

  return (
    <div className={classes.tooltip}>
      <Card className={classes.tooltipCard}>
        <CardHeader
          className={classes.tooltipHeader}
          title={
            <Typography color="textPrimary" variant="caption">
              {dateString}
              {spotterSurfaceTemp ? " UTC" : ""}
            </Typography>
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
              {spotterSurfaceTemp &&
                TemperatureMetric(
                  spotterSurfaceTemp,
                  "TEMP AT BUOY",
                  surfaceTemperature ? 6 : 12,
                  classes.tooltipContentItem
                )}
              {!spotterSurfaceTemp &&
                bottomTemperature &&
                TemperatureMetric(
                  bottomTemperature,
                  `TEMP AT ${depth}m`,
                  surfaceTemperature ? 6 : 12,
                  classes.tooltipContentItem
                )}
              {surfaceTemperature &&
                TemperatureMetric(
                  surfaceTemperature,
                  "SURFACE TEMP",
                  spotterSurfaceTemp || bottomTemperature ? 6 : 12,
                  classes.tooltipContentItem
                )}

              {spotterSurfaceTemp &&
                bottomTemperature &&
                TemperatureMetric(
                  bottomTemperature,
                  `TEMP AT ${depth}m`,
                  12,
                  surfaceTemperature
                    ? classes.tooltipContentLargeItem
                    : classes.tooltipContentItem
                )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <div
        className={classes.tooltipArrow}
        style={{
          borderColor: "#095877 transparent transparent transparent",
        }}
      />
    </div>
  );
};

const styles = () =>
  createStyles({
    tooltip: {
      display: "flex",
      justifyContent: "center",
      width: 200,
      minHeight: 100,
    },
    tooltipCard: {
      display: "flex",
      flexFlow: "column",
      backgroundColor: "#095877",
      borderRadius: 8,
    },
    tooltipHeader: {
      flex: "0 1 auto",
      padding: "0.5rem 1rem 0 1rem",
      height: 30,
    },
    tooltipContent: {
      flex: "1 1 auto",
      padding: "0rem 1rem 0.5rem 1rem",
    },
    tooltipContentItem: {
      width: "100px",
      height: 50,
      margin: "0",
    },
    tooltipContentLargeItem: {
      height: 50,
      width: "200px",
    },
    tooltipArrow: {
      content: " ",
      position: "absolute",
      top: "100%" /* At the bottom of the tooltip */,
      left: "50%",
      marginLeft: "-10px",
      borderWidth: "10px",
      borderStyle: "solid",
      borderColor: "#095877 transparent transparent transparent",
    },
  });

export interface TooltipData {
  date: string;
  depth: number | null;
  spotterSurfaceTemp: number | null;
  bottomTemperature: number | null;
  surfaceTemperature: number | null;
}

type TooltipProps = TooltipData & WithStyles<typeof styles>;

export default withStyles(styles)(Tooltip);
