import React from "react";
import { createStyles, Grid, withStyles, WithStyles } from "@material-ui/core";

import ChartWithTooltip, {
  ChartWithTooltipProps,
} from "../../../common/Chart/ChartWithTooltip";

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

type ChartsProps = ChartWithTooltipProps & WithStyles<typeof styles>;

export default withStyles(styles)(Charts);
