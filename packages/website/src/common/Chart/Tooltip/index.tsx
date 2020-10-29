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

import styled from "@material-ui/core/styles/styled";
import { formatNumber } from "../../../helpers/numberUtils";

const Circle = styled("div")<{}, { color: string; size?: number }>(
  ({ size = 10, color: backgroundColor }) => ({
    marginRight: 5,
    marginTop: 3,
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor,
    display: "inline-block",
  })
);

const TemperatureMetric = (
  temperature: number,
  title: string,
  color: string,
  gridClassName: string | undefined
) => (
  <Grid item xs={12} className={gridClassName}>
    <Grid container justify="flex-start" item>
      <Circle color={color} />
      <Typography variant="caption">
        {title} {`${formatNumber(temperature, 1)} °C`}
      </Typography>
    </Grid>
  </Grid>
);

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
              {surfaceTemperature &&
                TemperatureMetric(
                  surfaceTemperature,
                  "SURFACE",
                  "#6bc1e1",
                  classes.tooltipContentItem
                )}
              {spotterSurfaceTemp &&
                TemperatureMetric(
                  spotterSurfaceTemp,
                  "BUOY 1m",
                  "#6bc1e1",
                  classes.tooltipContentItem
                )}
              {bottomTemperature &&
                TemperatureMetric(
                  bottomTemperature,
                  `BUOY ${depth}m`,
                  "rgb(94, 164, 203)",
                  classes.tooltipContentItem
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
      width: 160,
      minHeight: 60,
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
      width: "120px",
      height: 30,
      margin: "0",
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
