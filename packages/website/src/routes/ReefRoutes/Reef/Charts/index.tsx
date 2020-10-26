import React from "react";
import {
  createStyles,
  Theme,
  Typography,
  WithStyles,
  withStyles,
} from "@material-ui/core";
import type {
  DailyData,
  SpotterData,
  Range,
} from "../../../../store/Reefs/types";

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
  dailyData: DailyData[];
  spotterData?: SpotterData;
  startDate?: string;
  endDate?: string;
  chartPeriod?: "hour" | Range | null;
  surveys: SurveyListItem[];
  temperatureThreshold: number | null;
  maxMonthlyMean: number | null;
  depth: number | null;
}

Charts.defaultProps = {
  spotterData: { surfaceTemperature: [], bottomTemperature: [] },
  startDate: "",
  endDate: "",
  chartPeriod: null,
};

type ChartsProps = ChartsIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Charts);
