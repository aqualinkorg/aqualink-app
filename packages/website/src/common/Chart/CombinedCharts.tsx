import React from "react";
import {
  Box,
  createStyles,
  Typography,
  withStyles,
  WithStyles,
} from "@material-ui/core";

import ChartWithTooltip from "./ChartWithTooltip";
import MultipleSensorsCharts from "./MultipleSensorsCharts";
import { Site } from "../../store/Sites/types";
import { convertSurveyDataToLocalTime } from "../../helpers/dates";
import { SurveyListItem } from "../../store/Survey/types";
import { standardDailyDataDataset } from "./MultipleSensorsCharts/helpers";

const CombinedCharts = ({
  site,
  selectedSurveyPointId,
  surveys,
  classes,
}: CombinedChartsProps) => {
  const { id, timezone, dailyData, maxMonthlyMean } = site;

  const heatStressDataset = standardDailyDataDataset(
    dailyData,
    maxMonthlyMean,
    true,
    timezone
  );

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
