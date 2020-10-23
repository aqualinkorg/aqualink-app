import React from "react";
import {
  createStyles,
  Theme,
  Typography,
  WithStyles,
  withStyles,
} from "@material-ui/core";
import type { DailyData, SpotterData } from "../../../../store/Reefs/types";

import ChartWithTooltip from "../../../../common/Chart/ChartWithTooltip";
import { SurveyListItem } from "../../../../store/Survey/types";

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
    },
    graphTitle: {
      lineHeight: 1.5,
      marginLeft: "4rem",
      marginTop: "3rem",

      [theme.breakpoints.down("xs")]: {
        marginLeft: 0,
      },
    },
  });

interface ChartsIncomingProps {
  title: string;
  dailyData: DailyData[];
  spotterData?: SpotterData;
  surveys: SurveyListItem[];
  temperatureThreshold: number | null;
  maxMonthlyMean: number | null;
  depth: number | null;
}

Charts.defaultProps = {
  spotterData: { surfaceTemperature: [], bottomTemperature: [] },
};

type ChartsProps = ChartsIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Charts);
