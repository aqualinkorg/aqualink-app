import React from "react";
import { createStyles, Grid, withStyles, WithStyles } from "@material-ui/core";
import type { Data } from "../../../../store/Reefs/types";
import "../../../../helpers/backgroundPlugin";
import "../../../../helpers/fillPlugin";
import "../../../../helpers/slicePlugin";
import Chart from "../../../../common/Chart";

const Charts = ({ classes, ...rest }: ChartsProps) => {
  return (
    <Grid item xs={11}>
      <Chart {...rest} className={classes.root} />
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
