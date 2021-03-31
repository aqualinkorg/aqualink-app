import React from "react";
import {
  Box,
  createStyles,
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
      <Box className={classes.graphtTitleWrapper}>
        <Typography className={classes.graphTitle} variant="h6">
          DAILY SATELLITE TEMPERATURE (°C)
        </Typography>
      </Box>
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
      />
      {showSpotterChart && (
        <ChartWithCard
          title="SENSOR TEMPERATURE (°C)"
          reef={reef}
          pointId={closestSurveyPointId}
          surveysFiltered={false}
          disableGutters
        />
      )}
    </div>
  );
};

const styles = () =>
  createStyles({
    chart: {
      height: "16rem",
      marginBottom: "3rem",
      marginTop: "1rem",
    },
    graphtTitleWrapper: {
      marginLeft: 42,
    },
    graphTitle: {
      lineHeight: 1.5,
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
