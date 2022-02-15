import React from "react";
import {
  Box,
  createStyles,
  Typography,
  withStyles,
  WithStyles,
} from "@material-ui/core";
import { isNumber } from "lodash";

import ChartWithTooltip from "./ChartWithTooltip";
import MultipleSensorsCharts from "./MultipleSensorsCharts";
import { Site } from "../../store/Sites/types";
import {
  convertDailyDataToLocalTime,
  convertSurveyDataToLocalTime,
} from "../../helpers/dates";
import { SurveyListItem } from "../../store/Survey/types";
import { Dataset } from ".";
import { convertDailyToSofar } from "./utils";
import {
  DAILY_DATA_CURVE_COLOR,
  DAILY_DATA_FILL_COLOR_ABOVE_THRESHOLD,
  DAILY_DATA_FILL_COLOR_BELOW_THRESHOLD,
} from "../../constants/charts";

const CombinedCharts = ({
  site,
  selectedSurveyPointId,
  surveys,
  classes,
}: CombinedChartsProps) => {
  const { id, timezone, dailyData, maxMonthlyMean } = site;

  const heatStressDataset: Dataset = {
    label: "SURFACE",
    data:
      convertDailyToSofar(convertDailyDataToLocalTime(dailyData, timezone), [
        "satelliteTemperature",
      ])?.satelliteTemperature || [],
    curveColor: DAILY_DATA_CURVE_COLOR,
    maxHoursGap: 48,
    tooltipMaxHoursGap: 24,
    type: "line",
    unit: "°C",
    considerForXAxisLimits: true,
    surveysAttached: true,
    isDailyUpdated: true,
    threshold: isNumber(maxMonthlyMean) ? maxMonthlyMean + 1 : undefined,
    fillColorAboveThreshold: DAILY_DATA_FILL_COLOR_ABOVE_THRESHOLD,
    fillColorBelowThreshold: DAILY_DATA_FILL_COLOR_BELOW_THRESHOLD,
  };

  return (
    <div>
      <Box className={classes.graphtTitleWrapper}>
        <Typography className={classes.graphTitle} variant="h6">
          HEAT STRESS ANALYSIS (°C)
        </Typography>
      </Box>
      <ChartWithTooltip
        className={classes.chart}
        siteId={id}
        datasets={[heatStressDataset]}
        surveys={convertSurveyDataToLocalTime(surveys, timezone)}
        temperatureThreshold={maxMonthlyMean ? maxMonthlyMean + 1 : null}
        maxMonthlyMean={maxMonthlyMean || null}
        background
        timeZone={timezone}
      />
      <MultipleSensorsCharts
        site={site}
        pointId={selectedSurveyPointId}
        surveysFiltered={false}
        disableGutters
      />
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
  site: Site;
  selectedSurveyPointId: string | undefined;
  surveys: SurveyListItem[];
}

type CombinedChartsProps = CombinedChartsIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(CombinedCharts);
