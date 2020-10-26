import React from "react";
import { createStyles, Grid, withStyles, WithStyles } from "@material-ui/core";
import type { DailyData } from "../../../store/Reefs/types";

import ChartWithTooltip from "../../../common/Chart/ChartWithTooltip";
import { SurveyListItem } from "../../../store/Survey/types";

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
  dailyData: DailyData[];
  surveys: SurveyListItem[];
  maxMonthlyMean: number | null;
  temperatureThreshold: number | null;
  depth: number | null;
  background: boolean;
}

type ChartsProps = ChartsIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Charts);
