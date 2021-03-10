import React from "react";
import {
  createStyles,
  Theme,
  Typography,
  withStyles,
  WithStyles,
} from "@material-ui/core";

import ChartWithTooltip from "./ChartWithTooltip";
import ChartWithCard from "./ChartWithCard";
import { Reef } from "../../store/Reefs/types";
import {
  convertDailyDataToLocalTime,
  convertSurveyDataToLocalTime,
} from "../../helpers/dates";
import { SurveyListItem } from "../../store/Survey/types";

const CombinedCharts = ({
  reef,
  closestSurveyPointId,
  surveys,
  showSpotterChart,
  classes,
}: CombinedChartsProps) => {
  const { id, timezone, dailyData, depth, maxMonthlyMean } = reef;
  return (
    <div>
      <ChartWithTooltip
        reefId={id}
        depth={depth}
        dailyData={convertDailyDataToLocalTime(dailyData, timezone)}
        surveys={convertSurveyDataToLocalTime(surveys, timezone)}
        temperatureThreshold={maxMonthlyMean ? maxMonthlyMean + 1 : null}
        maxMonthlyMean={maxMonthlyMean || null}
        background
        className={classes.chart}
        timeZone={timezone}
      >
        <Typography className={classes.graphTitle} variant="h6">
          DAILY WATER TEMPERATURE (°C)
        </Typography>
      </ChartWithTooltip>
      {showSpotterChart && (
        <ChartWithCard reef={reef} pointId={closestSurveyPointId} />
      )}
    </div>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    chart: {
      height: "16rem",
      marginBottom: "3rem",
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

interface CombinedChartsIncomingProps {
  reef: Reef;
  closestSurveyPointId: string | undefined;
  surveys: SurveyListItem[];
  showSpotterChart: boolean;
}

type CombinedChartsProps = CombinedChartsIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(CombinedCharts);
