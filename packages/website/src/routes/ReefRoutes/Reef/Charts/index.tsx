import React from "react";
import {
  createStyles,
  Theme,
  Typography,
  WithStyles,
  withStyles,
} from "@material-ui/core";
import type { DailyData } from "../../../../store/Reefs/types";

import ChartWithTooltip from "../../../../common/Chart/ChartWithTooltip";
import { SurveyListItem } from "../../../../store/Survey/types";

const Charts = ({ classes, ...rest }: ChartsProps) => {
  return (
    <ChartWithTooltip {...rest} className={classes.root}>
      <Typography className={classes.graphTitle} variant="h6">
        DAILY WATER TEMPERATURE (°C)
      </Typography>
    </ChartWithTooltip>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    root: {
      height: "16rem",
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
  dailyData: DailyData[];
  surveys: SurveyListItem[];
  temperatureThreshold: number | null;
  maxMonthlyMean: number | null;
  depth: number | null;
}

type ChartsProps = ChartsIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Charts);
