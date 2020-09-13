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
import { formatNumber } from "../../../../../helpers/numberUtils";

const Tooltip = ({
  date,
  depth,
  bottomTemperature,
  surfaceTemperature,
  classes,
}: TooltipProps) => {
  // Remove seconds from date
  const dateString = new Date(date).toLocaleString("en", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });

  return (
    <Card className={classes.tooltip}>
      <CardHeader
        className={classes.tooltipHeader}
        title={
          <Typography color="textPrimary" variant="caption">
            {dateString}
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
            <Grid item xs={6}>
              <Grid container justify="flex-start" item xs={12}>
                <Typography variant="caption">{`TEMP AT ${depth}M`}</Typography>
              </Grid>
              <Grid container justify="flex-start" item xs={12}>
                <Typography variant="h5">
                  {`${formatNumber(bottomTemperature, 1)} °C`}
                </Typography>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Grid container justify="flex-end" item xs={12}>
                <Typography variant="caption">SURFACE TEMP</Typography>
              </Grid>
              <Grid container justify="flex-end" item xs={12}>
                <Typography variant="h5">
                  {`${formatNumber(surfaceTemperature, 1)} °C`}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const styles = () =>
  createStyles({
    tooltip: {
      height: 100,
      width: 200,
      display: "flex",
      flexFlow: "column",
      backgroundColor: "#404b6b",
      opacity: 0.9,
    },
    tooltipHeader: {
      flex: "0 1 auto",
      padding: "0.5rem 1rem 0 1rem",
    },
    tooltipContent: {
      flex: "1 1 auto",
      padding: "0.5rem 1rem 0.5rem 1rem",
    },
    tooltipContentRow: {
      display: "flex",
      alignItems: "baseline",
    },
  });

export interface TooltipData {
  date: string;
  depth: number | null;
  bottomTemperature: number;
  surfaceTemperature: number;
}

type TooltipProps = TooltipData & WithStyles<typeof styles>;

export default withStyles(styles)(Tooltip);
