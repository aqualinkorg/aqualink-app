import React from "react";
import {
  createStyles,
  Theme,
  Typography,
  WithStyles,
  withStyles,
} from "@material-ui/core";

import ChartWithTooltip from "../../../../common/Chart/ChartWithTooltip";
import type { ChartWithTooltipProps } from "../../../../common/Chart/ChartWithTooltip";

const Charts = ({ classes, title, ...rest }: ChartsProps) => {
  return (
    <ChartWithTooltip {...rest} className={classes.root}>
      <Typography className={classes.graphTitle} variant="h6">
        {title}
      </Typography>
    </ChartWithTooltip>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    root: {
      height: "16rem",
      marginBottom: "6rem",
      marginTop: "1rem",
    },
    graphTitle: {
      lineHeight: 1.5,
      marginLeft: "4rem",

      [theme.breakpoints.down("xs")]: {
        marginLeft: 0,
      },
    },
  });

interface ChartsIncomingProps {
  title: string;
}

type ChartsProps = ChartsIncomingProps &
  ChartWithTooltipProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(Charts);
