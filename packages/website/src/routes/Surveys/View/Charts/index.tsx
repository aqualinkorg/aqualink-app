import React from "react";
import { createStyles, Grid, withStyles, WithStyles } from "@material-ui/core";
import type { Data } from "../../../../store/Reefs/types";
import "../../../../common/Chart/backgroundPlugin";
import "../../../../common/Chart/fillPlugin";
import "../../../../common/Chart/slicePlugin";
import ChartWithTooltip from "../../../../common/Chart/ChartWithTooltip";

const Charts = ({ classes, ...rest }: ChartsProps) => {
  return (
    <Grid item xs={11}>
      <ChartWithTooltip {...rest} className={classes.root} />
    </Grid>
  );
};

const styles = () =>
  createStyles({
    root: {
      height: "10rem",
    },
  });

interface ChartsIncomingProps {
  dailyData: Data[];
  temperatureThreshold: number | null;
  depth: number | null;
}

type ChartsProps = ChartsIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Charts);
